from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import (Student, FeeStructure, FeePayment, FeeBalance,
                     SemesterReporting, UnitRegistration, Mark)
from .serializers import (StudentSerializer, FeeStructureSerializer, FeePaymentSerializer,
                           FeeBalanceSerializer, SemesterReportingSerializer,
                           UnitRegistrationSerializer, MarkSerializer)
from core.models import Unit, Semester, AcademicYear


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related('user', 'programme').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            return Student.objects.filter(user=user)
        return super().get_queryset()

    @action(detail=False, methods=['get'], url_path='my-profile')
    def my_profile(self, request):
        student = get_object_or_404(Student, user=request.user)
        serializer = self.get_serializer(student)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        student = get_object_or_404(Student, user=request.user)
        active_year = AcademicYear.objects.filter(is_active=True).first()

        # Active semester for this student
        active_sem = Semester.objects.filter(
            academic_year=active_year,
            year_of_study=student.current_year_of_study,
            semester_number=student.current_semester_number,
            is_active=True
        ).first()

        # Fee balance
        fee_balance = FeeBalance.objects.filter(student=student, semester=active_sem).first()

        # Registered units
        registrations = UnitRegistration.objects.filter(
            student=student, semester=active_sem, status='registered'
        ).select_related('unit')

        # Has reported for semester
        reported = SemesterReporting.objects.filter(
            student=student, semester=active_sem, approved=True
        ).exists()

        return Response({
            'student': StudentSerializer(student).data,
            'active_semester': str(active_sem) if active_sem else None,
            'active_semester_id': active_sem.id if active_sem else None,
            'registration_open': active_sem.registration_open if active_sem else False,
            'has_reported': reported,
            'fee_balance': FeeBalanceSerializer(fee_balance).data if fee_balance else None,
            'registered_units': UnitRegistrationSerializer(registrations, many=True).data,
        })


class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


class FeePaymentViewSet(viewsets.ModelViewSet):
    queryset = FeePayment.objects.select_related('student', 'semester').all()
    serializer_class = FeePaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = get_object_or_404(Student, user=user)
            return FeePayment.objects.filter(student=student)
        return super().get_queryset()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'student':
            student = get_object_or_404(Student, user=user)
            serializer.save(student=student)
        else:
            serializer.save()


class FeeBalanceViewSet(viewsets.ModelViewSet):
    queryset = FeeBalance.objects.all()
    serializer_class = FeeBalanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = get_object_or_404(Student, user=user)
            return FeeBalance.objects.filter(student=student)
        return super().get_queryset()


class SemesterReportingViewSet(viewsets.ModelViewSet):
    queryset = SemesterReporting.objects.all()
    serializer_class = SemesterReportingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = get_object_or_404(Student, user=user)
            return SemesterReporting.objects.filter(student=student)
        return super().get_queryset()

    def perform_create(self, serializer):
        student = get_object_or_404(Student, user=self.request.user)
        serializer.save(student=student)


class UnitRegistrationViewSet(viewsets.ModelViewSet):
    queryset = UnitRegistration.objects.select_related('student', 'unit', 'semester').all()
    serializer_class = UnitRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'student':
            student = get_object_or_404(Student, user=user)
            qs = UnitRegistration.objects.filter(student=student)
        else:
            qs = super().get_queryset()
        sem = self.request.query_params.get('semester')
        if sem:
            qs = qs.filter(semester_id=sem)
        return qs

    def create(self, request, *args, **kwargs):
        student = get_object_or_404(Student, user=request.user)
        unit_id = request.data.get('unit')
        semester_id = request.data.get('semester')
        semester = get_object_or_404(Semester, id=semester_id)
        unit = get_object_or_404(Unit, id=unit_id)

        # Must have reported for semester
        reported = SemesterReporting.objects.filter(
            student=student, semester=semester, approved=True
        ).exists()
        if not reported:
            return Response({'error': 'You must report for the semester before registering units.'},
                            status=status.HTTP_403_FORBIDDEN)

        # Unit must match student's current year & semester
        if (unit.year_of_study != student.current_year_of_study or
                unit.semester_number != student.current_semester_number):
            return Response({'error': 'You can only register units for your current year and semester.'},
                            status=status.HTTP_400_BAD_REQUEST)

        reg, created = UnitRegistration.objects.get_or_create(
            student=student, unit=unit, semester=semester,
            defaults={'status': 'registered'}
        )
        if not created:
            return Response({'error': 'Already registered for this unit.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = UnitRegistrationSerializer(reg)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MarkViewSet(viewsets.ModelViewSet):
    queryset = Mark.objects.select_related('student', 'unit', 'semester').all()
    serializer_class = MarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'student':
            student = get_object_or_404(Student, user=user)
            return qs.filter(student=student)
        unit = self.request.query_params.get('unit')
        semester = self.request.query_params.get('semester')
        if unit:
            qs = qs.filter(unit_id=unit)
        if semester:
            qs = qs.filter(semester_id=semester)
        return qs