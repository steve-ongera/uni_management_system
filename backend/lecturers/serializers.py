from rest_framework import serializers
from .models import Lecturer, UnitAllocation, Note


class LecturerSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Lecturer
        fields = '__all__'
        read_only_fields = ['user', 'created_at']

    def get_full_name(self, obj):
        return obj.full_name()


class UnitAllocationSerializer(serializers.ModelSerializer):
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    programme_name = serializers.CharField(source='unit.programme.name', read_only=True)
    year_of_study = serializers.IntegerField(source='unit.year_of_study', read_only=True)
    semester_number = serializers.IntegerField(source='unit.semester_number', read_only=True)
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)
    lecturer_name = serializers.CharField(source='lecturer.full_name', read_only=True)

    class Meta:
        model = UnitAllocation
        fields = '__all__'


class NoteSerializer(serializers.ModelSerializer):
    unit_code = serializers.CharField(source='unit.code', read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    lecturer_name = serializers.CharField(source='lecturer.full_name', read_only=True)
    semester_label = serializers.CharField(source='semester.__str__', read_only=True)

    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ['lecturer', 'uploaded_at', 'updated_at']