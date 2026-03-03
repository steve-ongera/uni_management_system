from django.db import models
from core.models import User, Programme, AcademicYear, Semester, Unit


class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    registration_number = models.CharField(max_length=30, unique=True)  # SC211/0530/2022
    kcse_index = models.CharField(max_length=30)                         # 0011/8278/2019 (used as password seed)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    programme = models.ForeignKey(Programme, on_delete=models.SET_NULL, null=True, related_name='students')
    current_year_of_study = models.PositiveIntegerField(default=1)
    current_semester_number = models.PositiveIntegerField(default=1)
    phone = models.CharField(max_length=15, blank=True)
    id_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    admission_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.registration_number} - {self.first_name} {self.last_name}"

    def full_name(self):
        return f"{self.first_name} {self.middle_name} {self.last_name}".strip()


class FeeStructure(models.Model):
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='fee_structures')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='fee_structures')
    year_of_study = models.PositiveIntegerField()
    semester_number = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('programme', 'academic_year', 'year_of_study', 'semester_number')

    def __str__(self):
        return f"{self.programme.code} Y{self.year_of_study}S{self.semester_number} - {self.amount}"


class FeePayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_payments')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='fee_payments')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='fee_payments', null=True)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_code = models.CharField(max_length=100)
    payment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                      related_name='confirmed_payments')

    def __str__(self):
        return f"{self.student.registration_number} - {self.amount_paid} ({self.status})"


class FeeBalance(models.Model):
    """Running fee balance per student per semester"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='fee_balances')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='fee_balances')
    expected_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    carried_forward = models.DecimalField(max_digits=10, decimal_places=2, default=0,
                                           help_text="Extra paid pushed to next semester")

    class Meta:
        unique_together = ('student', 'semester')

    @property
    def balance(self):
        return self.expected_amount - self.paid_amount

    def __str__(self):
        return f"{self.student.registration_number} - Sem:{self.semester} Balance:{self.balance}"


class SemesterReporting(models.Model):
    """Student must report for a semester before registering units"""
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='semester_reports')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='semester_reports')
    reported_at = models.DateTimeField(auto_now_add=True)
    approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='approved_reports')

    class Meta:
        unique_together = ('student', 'semester')

    def __str__(self):
        return f"{self.student.registration_number} reported for {self.semester}"


class UnitRegistration(models.Model):
    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('dropped', 'Dropped'),
        ('completed', 'Completed'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='unit_registrations')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='unit_registrations')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='unit_registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='registered')

    class Meta:
        unique_together = ('student', 'unit', 'semester')

    def __str__(self):
        return f"{self.student.registration_number} - {self.unit.code}"


class Mark(models.Model):
    GRADE_CHOICES = [
        ('A', 'A'), ('A-', 'A-'), ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
        ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'), ('D+', 'D+'), ('D', 'D'),
        ('D-', 'D-'), ('E', 'E'), ('F', 'F'),
    ]
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='marks')
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='marks')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='marks')
    cat_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                     help_text="Continuous Assessment Test (out of 30)")
    exam_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True,
                                      help_text="Final Exam (out of 70)")
    total_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    grade = models.CharField(max_length=3, choices=GRADE_CHOICES, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_marks')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'unit', 'semester')

    def compute_grade(self):
        if self.total_score is None:
            return ''
        s = float(self.total_score)
        if s >= 70: return 'A'
        elif s >= 65: return 'A-'
        elif s >= 60: return 'B+'
        elif s >= 55: return 'B'
        elif s >= 50: return 'B-'
        elif s >= 45: return 'C+'
        elif s >= 40: return 'C'
        elif s >= 35: return 'C-'
        elif s >= 30: return 'D+'
        elif s >= 25: return 'D'
        elif s >= 20: return 'D-'
        elif s >= 15: return 'E'
        return 'F'

    def save(self, *args, **kwargs):
        if self.cat_score is not None and self.exam_score is not None:
            self.total_score = self.cat_score + self.exam_score
        self.grade = self.compute_grade()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.registration_number} - {self.unit.code}: {self.total_score}"