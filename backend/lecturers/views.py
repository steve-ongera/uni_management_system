from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Lecturer, UnitAllocation, Note
from .serializers import LecturerSerializer, UnitAllocationSerializer, NoteSerializer
from students.models import Student, Mark, UnitRegistration
from students.serializers import MarkSerializer, StudentSerializer


class LecturerViewSet(viewsets.ModelViewSet):
    queryset = Lecturer.objects.select_related('user').all()
    serializer_class = LecturerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'lecturer':
            return Lecturer.objects.filter(user=user)
        return super().get_queryset()

    @action(detail=False, methods=['get'], url_path='my-profile')
    def my_profile(self, request):
        lecturer = get_object_or_404(Lecturer, user=request.user)
        return Response(LecturerSerializer(lecturer).data)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        lecturer = get_object_or_404(Lecturer, user=request.user)
        allocations = UnitAllocation.objects.filter(lecturer=lecturer).select_related('unit', 'semester')
        return Response({
            'lecturer': LecturerSerializer(lecturer).data,
            'allocations': UnitAllocationSerializer(allocations, many=True).data,
        })


class UnitAllocationViewSet(viewsets.ModelViewSet):
    queryset = UnitAllocation.objects.select_related('lecturer', 'unit', 'semester').all()
    serializer_class = UnitAllocationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'lecturer':
            lecturer = get_object_or_404(Lecturer, user=user)
            return qs.filter(lecturer=lecturer)
        return qs


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.select_related('lecturer', 'unit', 'semester').all()
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        unit = self.request.query_params.get('unit')
        semester = self.request.query_params.get('semester')
        if user.role == 'lecturer':
            lecturer = get_object_or_404(Lecturer, user=user)
            qs = qs.filter(lecturer=lecturer)
        elif user.role == 'student':
            # Students see notes for their registered units
            student = get_object_or_404(Student, user=user)
            registered_unit_ids = UnitRegistration.objects.filter(
                student=student, status='registered'
            ).values_list('unit_id', flat=True)
            qs = qs.filter(unit_id__in=registered_unit_ids)
        if unit:
            qs = qs.filter(unit_id=unit)
        if semester:
            qs = qs.filter(semester_id=semester)
        return qs

    def perform_create(self, serializer):
        lecturer = get_object_or_404(Lecturer, user=self.request.user)
        serializer.save(lecturer=lecturer)


class LecturerMarksViewSet(viewsets.ModelViewSet):
    """Lecturer uploads/edits marks for their allocated units"""
    queryset = Mark.objects.select_related('student', 'unit', 'semester').all()
    serializer_class = MarkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        lecturer = get_object_or_404(Lecturer, user=user)
        allocated_unit_ids = UnitAllocation.objects.filter(lecturer=lecturer).values_list('unit_id', flat=True)
        qs = Mark.objects.filter(unit_id__in=allocated_unit_ids)
        unit = self.request.query_params.get('unit')
        semester = self.request.query_params.get('semester')
        if unit:
            qs = qs.filter(unit_id=unit)
        if semester:
            qs = qs.filter(semester_id=semester)
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='unit-students')
    def unit_students(self, request):
        """Get students registered for a given unit in a semester"""
        unit_id = request.query_params.get('unit')
        semester_id = request.query_params.get('semester')
        registrations = UnitRegistration.objects.filter(
            unit_id=unit_id, semester_id=semester_id, status='registered'
        ).select_related('student')
        students = [r.student for r in registrations]
        return Response(StudentSerializer(students, many=True).data)