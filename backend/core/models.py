#core/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ict')
        return self.create_user(username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('ict', 'ICT Admin'),
    ]
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'username'
    objects = UserManager()

    def __str__(self):
        return f"{self.username} ({self.role})"


class Department(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Programme(models.Model):
    SEMESTER_TYPE_CHOICES = [
        ('2', 'Two Semesters per Year'),
        ('3', 'Three Semesters per Year'),
    ]
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programmes')
    duration_years = models.PositiveIntegerField(default=4)
    semesters_per_year = models.CharField(max_length=1, choices=SEMESTER_TYPE_CHOICES, default='2')
    description = models.TextField(blank=True)

    def total_semesters(self):
        return self.duration_years * int(self.semesters_per_year)

    def __str__(self):
        return f"{self.code} - {self.name}"


class AcademicYear(models.Model):
    name = models.CharField(max_length=20)  # e.g. 2025/2026
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Semester(models.Model):
    """Represents a specific semester in an academic year e.g Year 1 Sem 1 of 2025/2026"""
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='semesters')
    year_of_study = models.PositiveIntegerField()      # 1,2,3,4
    semester_number = models.PositiveIntegerField()    # 1,2 or 1,2,3
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    registration_open = models.BooleanField(default=False)

    class Meta:
        unique_together = ('academic_year', 'year_of_study', 'semester_number')

    def __str__(self):
        return f"{self.academic_year} - Year {self.year_of_study} Sem {self.semester_number}"


class Unit(models.Model):
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='units')
    year_of_study = models.PositiveIntegerField()
    semester_number = models.PositiveIntegerField()
    credit_hours = models.PositiveIntegerField(default=3)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='units',
                                      null=True, blank=True,
                                      help_text="Set if unit was revised in a specific academic year")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('code', 'programme', 'academic_year')

    def __str__(self):
        return f"{self.code} - {self.name}"