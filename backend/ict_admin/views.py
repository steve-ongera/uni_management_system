from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from django.contrib.auth.hashers import make_password
from .models import SystemLog
from core.models import User, Programme, AcademicYear, Semester
from core.serializers import UserSerializer, ProgrammeSerializer, AcademicYearSerializer, SemesterSerializer
from students.models import Student, FeeBalance, SemesterReporting, FeePayment
from students.serializers import (StudentSerializer, FeeBalanceSerializer,
                                   SemesterReportingSerializer, FeePaymentSerializer)
from lecturers.models import Lecturer, UnitAllocation
from lecturers.serializers import LecturerSerializer, UnitAllocationSerializer


class IsICT(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'ict'


class SystemLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.username', read_only=True)

    class Meta:
        model = SystemLog
        fields = '__all__'


class SystemLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SystemLog.objects.all().order_by('-timestamp')
    serializer_class = SystemLogSerializer
    permission_classes = [IsICT]


class UserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsICT]

    @action(detail=False, methods=['post'], url_path='create-student')
    def create_student(self, request):
        data = request.data
        reg_number = data.get('registration_number')
        kcse_index = data.get('kcse_index')
        programme_id = data.get('programme')

        if User.objects.filter(username=reg_number).exists():
            return Response({'error': 'Student with this registration number already exists.'}, status=400)

        user = User.objects.create_user(
            username=reg_number,
            password=kcse_index,
            role='student'
        )
        student = Student.objects.create(
            user=user,
            registration_number=reg_number,
            kcse_index=kcse_index,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            middle_name=data.get('middle_name', ''),
            programme_id=programme_id,
            current_year_of_study=data.get('current_year_of_study', 1),
            current_semester_number=data.get('current_semester_number', 1),
            phone=data.get('phone', ''),
            id_number=data.get('id_number', ''),
        )
        SystemLog.objects.create(
            performed_by=request.user,
            action='create',
            model_name='Student',
            object_id=str(student.id),
            description=f"Created student {reg_number}"
        )
        return Response(StudentSerializer(student).data, status=201)

    @action(detail=False, methods=['post'], url_path='create-lecturer')
    def create_lecturer(self, request):
        data = request.data
        staff_id = data.get('staff_id')
        password = data.get('password', staff_id)

        if User.objects.filter(username=staff_id).exists():
            return Response({'error': 'Lecturer with this staff ID already exists.'}, status=400)

        user = User.objects.create_user(
            username=staff_id,
            password=password,
            role='lecturer'
        )
        lecturer = Lecturer.objects.create(
            user=user,
            staff_id=staff_id,
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
        )
        SystemLog.objects.create(
            performed_by=request.user,
            action='create',
            model_name='Lecturer',
            object_id=str(lecturer.id),
            description=f"Created lecturer {staff_id}"
        )
        return Response(LecturerSerializer(lecturer).data, status=201)


class SemesterReportApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsICT]

    def list(self, request):
        reports = SemesterReporting.objects.select_related('student', 'semester').all()
        approved = request.query_params.get('approved')
        if approved is not None:
            reports = reports.filter(approved=approved == 'true')
        return Response(SemesterReportingSerializer(reports, many=True).data)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        report = get_object_or_404(SemesterReporting, pk=pk)
        report.approved = True
        report.approved_by = request.user
        report.save()
        SystemLog.objects.create(
            performed_by=request.user,
            action='approve',
            model_name='SemesterReporting',
            object_id=str(report.id),
            description=f"Approved semester report for {report.student.registration_number}"
        )
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        report = get_object_or_404(SemesterReporting, pk=pk)
        report.approved = False
        report.save()
        return Response({'status': 'rejected'})


class FeePaymentApprovalViewSet(viewsets.ViewSet):
    permission_classes = [IsICT]

    def list(self, request):
        payments = FeePayment.objects.select_related('student', 'semester').all().order_by('-payment_date')
        s = request.query_params.get('status')
        if s:
            payments = payments.filter(status=s)
        return Response(FeePaymentSerializer(payments, many=True).data)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm(self, request, pk=None):
        payment = get_object_or_404(FeePayment, pk=pk)
        payment.status = 'confirmed'
        payment.confirmed_by = request.user
        payment.save()

        # Update fee balance
        balance, _ = FeeBalance.objects.get_or_create(
            student=payment.student,
            semester=payment.semester,
            defaults={'expected_amount': 0, 'paid_amount': 0}
        )
        balance.paid_amount += payment.amount_paid

        # Handle extra payment — push to next semester
        if balance.paid_amount > balance.expected_amount:
            extra = balance.paid_amount - balance.expected_amount
            balance.carried_forward = extra
            balance.paid_amount = balance.expected_amount

        balance.save()
        return Response({'status': 'confirmed'})

    @action(detail=True, methods=['post'], url_path='reject')
    def reject_payment(self, request, pk=None):
        payment = get_object_or_404(FeePayment, pk=pk)
        payment.status = 'rejected'
        payment.save()
        return Response({'status': 'rejected'})


class ICTDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsICT]

    def list(self, request):
        total_students = Student.objects.count()
        total_lecturers = Lecturer.objects.count()
        active_year = AcademicYear.objects.filter(is_active=True).first()
        pending_reports = SemesterReporting.objects.filter(approved=False).count()
        pending_payments = FeePayment.objects.filter(status='pending').count()
        recent_logs = SystemLog.objects.all().order_by('-timestamp')[:10]

        return Response({
            'total_students': total_students,
            'total_lecturers': total_lecturers,
            'active_year': AcademicYearSerializer(active_year).data if active_year else None,
            'pending_reports': pending_reports,
            'pending_payments': pending_payments,
            'recent_logs': SystemLogSerializer(recent_logs, many=True).data,
        })