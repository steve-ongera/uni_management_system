from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .models import Department, Programme, AcademicYear, Semester, Unit
from .serializers import (LoginSerializer, UserSerializer, DepartmentSerializer,
                          ProgrammeSerializer, AcademicYearSerializer, SemesterSerializer,
                          UnitSerializer)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class ProgrammeViewSet(viewsets.ModelViewSet):
    queryset = Programme.objects.select_related('department').all()
    serializer_class = ProgrammeSerializer


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all().order_by('-start_date')
    serializer_class = AcademicYearSerializer


class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.select_related('academic_year').all()
    serializer_class = SemesterSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        academic_year = self.request.query_params.get('academic_year')
        if academic_year:
            qs = qs.filter(academic_year_id=academic_year)
        return qs


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.select_related('programme', 'academic_year').all()
    serializer_class = UnitSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        programme = self.request.query_params.get('programme')
        year_of_study = self.request.query_params.get('year_of_study')
        semester_number = self.request.query_params.get('semester_number')
        academic_year = self.request.query_params.get('academic_year')
        if programme:
            qs = qs.filter(programme_id=programme)
        if year_of_study:
            qs = qs.filter(year_of_study=year_of_study)
        if semester_number:
            qs = qs.filter(semester_number=semester_number)
        if academic_year:
            qs = qs.filter(academic_year_id=academic_year)
        return qs