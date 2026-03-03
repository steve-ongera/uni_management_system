from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Department, Programme, AcademicYear, Semester, Unit


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,
            'username': user.username,
            'user_id': user.id,
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'date_joined']
        read_only_fields = ['date_joined']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class ProgrammeSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    total_semesters = serializers.SerializerMethodField()

    class Meta:
        model = Programme
        fields = '__all__'

    def get_total_semesters(self, obj):
        return obj.total_semesters()


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = '__all__'


class SemesterSerializer(serializers.ModelSerializer):
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Semester
        fields = '__all__'


class UnitSerializer(serializers.ModelSerializer):
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = Unit
        fields = '__all__'