from django.db import models
from core.models import User


class SystemLog(models.Model):
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('approve', 'Approve'),
        ('reject', 'Reject'),
    ]
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='system_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=50, blank=True)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.performed_by} - {self.action} - {self.model_name} @ {self.timestamp}"