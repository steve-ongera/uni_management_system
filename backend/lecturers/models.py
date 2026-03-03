from django.db import models
from core.models import User, Unit, Semester


class Lecturer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer_profile')
    staff_id = models.CharField(max_length=30, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15, blank=True)
    photo = models.ImageField(upload_to='lecturer_photos/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.staff_id} - {self.full_name()}"


class UnitAllocation(models.Model):
    """Assigns a lecturer to teach a unit in a specific semester"""
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name='allocations')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='allocations')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='allocations')
    allocated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('lecturer', 'unit', 'semester')

    def __str__(self):
        return f"{self.lecturer.full_name()} -> {self.unit.code} ({self.semester})"


class Note(models.Model):
    lecturer = models.ForeignKey(Lecturer, on_delete=models.CASCADE, related_name='notes')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='notes')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='notes')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='notes/', null=True, blank=True)
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.unit.code} - {self.title}"