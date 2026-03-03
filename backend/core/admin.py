from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Department, Programme, AcademicYear, Semester, Unit


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_active', 'is_staff']
    search_fields = ['username', 'email']
    ordering = ['-date_joined']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('email',)}),
        ('Role & Status', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
        ('Permissions', {'fields': ('groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'role', 'email', 'is_active', 'is_staff'),
        }),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'created_at']
    search_fields = ['name', 'code']
    ordering = ['name']


@admin.register(Programme)
class ProgrammeAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'department', 'duration_years', 'semesters_per_year', 'total_semesters_display']
    list_filter = ['department', 'duration_years', 'semesters_per_year']
    search_fields = ['name', 'code']
    ordering = ['code']

    def total_semesters_display(self, obj):
        return obj.total_semesters()
    total_semesters_display.short_description = 'Total Semesters'


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active']
    ordering = ['-start_date']
    actions = ['set_active']

    def set_active(self, request, queryset):
        AcademicYear.objects.update(is_active=False)
        queryset.update(is_active=True)
        self.message_user(request, f"Set {queryset.count()} academic year(s) as active.")
    set_active.short_description = 'Set selected as active academic year'


@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'academic_year', 'year_of_study', 'semester_number',
                    'start_date', 'end_date', 'is_active', 'registration_open']
    list_filter = ['academic_year', 'is_active', 'registration_open', 'year_of_study']
    ordering = ['academic_year', 'year_of_study', 'semester_number']
    actions = ['open_registration', 'close_registration', 'set_active']

    def open_registration(self, request, queryset):
        queryset.update(registration_open=True)
        self.message_user(request, f"Opened registration for {queryset.count()} semester(s).")
    open_registration.short_description = 'Open unit registration'

    def close_registration(self, request, queryset):
        queryset.update(registration_open=False)
        self.message_user(request, f"Closed registration for {queryset.count()} semester(s).")
    close_registration.short_description = 'Close unit registration'

    def set_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f"Activated {queryset.count()} semester(s).")
    set_active.short_description = 'Mark selected semesters as active'


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'programme', 'year_of_study', 'semester_number',
                    'credit_hours', 'academic_year', 'is_active']
    list_filter = ['programme', 'year_of_study', 'semester_number', 'academic_year', 'is_active']
    search_fields = ['code', 'name']
    ordering = ['programme', 'year_of_study', 'semester_number', 'code']