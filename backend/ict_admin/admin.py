from django.contrib import admin
from .models import SystemLog


@admin.register(SystemLog)
class SystemLogAdmin(admin.ModelAdmin):
    list_display = ['performed_by', 'action', 'model_name', 'object_id', 'description', 'timestamp']
    list_filter = ['action', 'model_name']
    search_fields = ['description', 'performed_by__username']
    ordering = ['-timestamp']
    readonly_fields = ['performed_by', 'action', 'model_name', 'object_id', 'description', 'timestamp']

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False