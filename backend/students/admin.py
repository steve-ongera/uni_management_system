from django.contrib import admin
from .models import Student, FeeStructure, FeePayment, FeeBalance, SemesterReporting, UnitRegistration, Mark


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['registration_number', 'full_name', 'programme', 'current_year_of_study',
                    'current_semester_number', 'is_active']
    list_filter = ['programme', 'current_year_of_study', 'current_semester_number', 'is_active']
    search_fields = ['registration_number', 'first_name', 'last_name', 'kcse_index']
    ordering = ['registration_number']
    readonly_fields = ['created_at']

    def full_name(self, obj):
        return obj.full_name()
    full_name.short_description = 'Full Name'


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = ['programme', 'academic_year', 'year_of_study', 'semester_number', 'amount']
    list_filter = ['programme', 'academic_year', 'year_of_study']
    ordering = ['programme', 'academic_year', 'year_of_study', 'semester_number']


@admin.register(FeePayment)
class FeePaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'amount_paid', 'transaction_code', 'semester', 'payment_date', 'status']
    list_filter = ['status', 'academic_year', 'semester']
    search_fields = ['student__registration_number', 'transaction_code']
    ordering = ['-payment_date']
    readonly_fields = ['payment_date']
    actions = ['confirm_payments', 'reject_payments']

    def confirm_payments(self, request, queryset):
        queryset.update(status='confirmed', confirmed_by=request.user)
        self.message_user(request, f"Confirmed {queryset.count()} payment(s).")
    confirm_payments.short_description = 'Confirm selected payments'

    def reject_payments(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"Rejected {queryset.count()} payment(s).")
    reject_payments.short_description = 'Reject selected payments'


@admin.register(FeeBalance)
class FeeBalanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'semester', 'expected_amount', 'paid_amount', 'balance_display', 'carried_forward']
    list_filter = ['semester']
    search_fields = ['student__registration_number']

    def balance_display(self, obj):
        return obj.balance
    balance_display.short_description = 'Balance'


@admin.register(SemesterReporting)
class SemesterReportingAdmin(admin.ModelAdmin):
    list_display = ['student', 'semester', 'reported_at', 'approved', 'approved_by']
    list_filter = ['approved', 'semester']
    search_fields = ['student__registration_number']
    ordering = ['-reported_at']
    readonly_fields = ['reported_at']
    actions = ['approve_reports']

    def approve_reports(self, request, queryset):
        queryset.update(approved=True, approved_by=request.user)
        self.message_user(request, f"Approved {queryset.count()} semester report(s).")
    approve_reports.short_description = 'Approve selected semester reports'


@admin.register(UnitRegistration)
class UnitRegistrationAdmin(admin.ModelAdmin):
    list_display = ['student', 'unit', 'semester', 'registered_at', 'status']
    list_filter = ['status', 'semester', 'unit__programme']
    search_fields = ['student__registration_number', 'unit__code']
    ordering = ['-registered_at']
    readonly_fields = ['registered_at']


@admin.register(Mark)
class MarkAdmin(admin.ModelAdmin):
    list_display = ['student', 'unit', 'semester', 'cat_score', 'exam_score', 'total_score', 'grade', 'uploaded_by']
    list_filter = ['semester', 'unit__programme', 'grade']
    search_fields = ['student__registration_number', 'unit__code']
    ordering = ['semester', 'unit', 'student']
    readonly_fields = ['total_score', 'grade', 'uploaded_at', 'updated_at']