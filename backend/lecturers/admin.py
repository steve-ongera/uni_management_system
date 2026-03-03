from django.contrib import admin
from .models import Lecturer, UnitAllocation, Note


@admin.register(Lecturer)
class LecturerAdmin(admin.ModelAdmin):
    list_display = ['staff_id', 'full_name_display', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['staff_id', 'first_name', 'last_name']
    ordering = ['staff_id']
    readonly_fields = ['created_at']

    def full_name_display(self, obj):
        return obj.full_name()
    full_name_display.short_description = 'Full Name'


@admin.register(UnitAllocation)
class UnitAllocationAdmin(admin.ModelAdmin):
    list_display = ['lecturer', 'unit', 'semester', 'allocated_at']
    list_filter = ['semester', 'unit__programme']
    search_fields = ['lecturer__staff_id', 'unit__code']
    ordering = ['-allocated_at']
    readonly_fields = ['allocated_at']


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'unit', 'lecturer', 'semester', 'uploaded_at']
    list_filter = ['semester', 'unit__programme']
    search_fields = ['title', 'unit__code', 'lecturer__staff_id']
    ordering = ['-uploaded_at']
    readonly_fields = ['uploaded_at', 'updated_at']