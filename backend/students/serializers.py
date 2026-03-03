from rest_framework import serializers
from .models import (Student, FeeStructure, FeePayment, FeeBalance,
                     SemesterReporting, UnitRegistration, Mark)
from core.serializers import ProgrammeSerializer, UnitSerializer, SemesterSerializer


class StudentSerializer(serializers.ModelSerializer):
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    programme_code = serializers.CharField(source='programme.code', read_only=True)
    semesters_per_year = serializers.CharField(source='programme.semesters_per_year', read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_full_name(self, obj):
        return obj.full_name()


class FeeStructureSerializer(serializers.ModelSerializer):
    programme_name = serializers.CharField(source='programme.name', read_only=True)
    academic_year_name = serializers.CharField(source='academic_year.name', read_only=True)

    class Meta:
        model = FeeStructure
        fields = '__all__'


class FeePaymentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    reg_number = serializers.CharField(source='student.registration_number', read_only=True)
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)

    class Meta:
        model = FeePayment
        fields = '__all__'
        read_only_fields = ['status', 'confirmed_by', 'payment_date']


class FeeBalanceSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True, source='balance')
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)

    class Meta:
        model = FeeBalance
        fields = '__all__'


class SemesterReportingSerializer(serializers.ModelSerializer):
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)

    class Meta:
        model = SemesterReporting
        fields = '__all__'
        read_only_fields = ['student', 'reported_at', 'approved', 'approved_by']


class UnitRegistrationSerializer(serializers.ModelSerializer):
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_credit_hours = serializers.IntegerField(source='unit.credit_hours', read_only=True)
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)

    class Meta:
        model = UnitRegistration
        fields = '__all__'
        read_only_fields = ['student', 'registered_at']


class MarkSerializer(serializers.ModelSerializer):
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    reg_number = serializers.CharField(source='student.registration_number', read_only=True)

    class Meta:
        model = Mark
        fields = '__all__'
        read_only_fields = ['total_score', 'grade', 'uploaded_by', 'uploaded_at', 'updated_at']