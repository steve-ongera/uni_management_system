"""
Management command to seed the database with realistic demo data.

Usage:
    python manage.py seed_data
    python manage.py seed_data --clear        # wipe existing data first
    python manage.py seed_data --minimal      # only core structure, no students/marks
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seeds the database with demo data for all three portals'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before seeding',
        )
        parser.add_argument(
            '--minimal',
            action='store_true',
            help='Seed only core structure (no students, lecturers, marks)',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self._clear_data()

        self.stdout.write(self.style.MIGRATE_HEADING('\n══════════════════════════════════════'))
        self.stdout.write(self.style.MIGRATE_HEADING('  UniManage — Seeding Demo Data'))
        self.stdout.write(self.style.MIGRATE_HEADING('══════════════════════════════════════\n'))

        with transaction.atomic():
            self._seed_users_and_ict()
            self._seed_departments()
            self._seed_programmes()
            self._seed_academic_years()
            self._seed_semesters()
            self._seed_units()

            if not options['minimal']:
                self._seed_lecturers()
                self._seed_students()
                self._seed_fee_structures()
                self._seed_allocations()
                self._seed_semester_reports()
                self._seed_unit_registrations()
                self._seed_marks()
                self._seed_fee_payments()

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('✔  Seeding complete!\n'))
        self._print_login_summary()

    # ─────────────────────────────────────────────
    # CLEAR
    # ─────────────────────────────────────────────
    def _clear_data(self):
        from students.models import Mark, UnitRegistration, SemesterReporting, FeePayment, FeeBalance, FeeStructure, Student
        from lecturers.models import Note, UnitAllocation, Lecturer
        from ict_admin.models import SystemLog
        from core.models import Unit, Semester, AcademicYear, Programme, Department, User

        Mark.objects.all().delete()
        UnitRegistration.objects.all().delete()
        SemesterReporting.objects.all().delete()
        FeePayment.objects.all().delete()
        FeeBalance.objects.all().delete()
        FeeStructure.objects.all().delete()
        Student.objects.all().delete()
        Note.objects.all().delete()
        UnitAllocation.objects.all().delete()
        Lecturer.objects.all().delete()
        SystemLog.objects.all().delete()
        Unit.objects.all().delete()
        Semester.objects.all().delete()
        AcademicYear.objects.all().delete()
        Programme.objects.all().delete()
        Department.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        self.stdout.write(self.style.SUCCESS('  Cleared all data.'))

    # ─────────────────────────────────────────────
    # ICT ADMIN SUPERUSER
    # ─────────────────────────────────────────────
    def _seed_users_and_ict(self):
        from core.models import User

        user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'role': 'ict',
                'email': 'admin@university.ac.ke',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            user.set_password('admin123')
            user.save()

        # Second ICT officer
        ict2, created2 = User.objects.get_or_create(
            username='ICT001',
            defaults={'role': 'ict', 'email': 'ict@university.ac.ke', 'is_staff': True}
        )
        if created2:
            ict2.set_password('ict@2025')
            ict2.save()

        self._ok('ICT Admin users', 'admin / ICT001')

    # ─────────────────────────────────────────────
    # DEPARTMENTS
    # ─────────────────────────────────────────────
    def _seed_departments(self):
        from core.models import Department

        departments = [
            ('School of Computing & IT',     'SCIT'),
            ('School of Health Sciences',    'SHS'),
            ('School of Business',           'SOB'),
            ('School of Education',          'SOE'),
        ]
        self.departments = {}
        for name, code in departments:
            dept, _ = Department.objects.get_or_create(code=code, defaults={'name': name})
            self.departments[code] = dept

        self._ok('Departments', ', '.join(self.departments.keys()))

    # ─────────────────────────────────────────────
    # PROGRAMMES
    # ─────────────────────────────────────────────
    def _seed_programmes(self):
        from core.models import Programme

        data = [
            # name, code, dept_code, years, sems_per_year
            ('Bachelor of Science in Information Technology', 'BSCIT',    'SCIT', 4, '2'),
            ('Bachelor of Science in Computer Science',       'BSCCS',    'SCIT', 4, '2'),
            ('Bachelor of Science in Nursing',                'BSCNURS',  'SHS',  4, '3'),
            ('Diploma in Health Records & Information',       'DHRI',     'SHS',  3, '2'),
            ('Bachelor of Commerce',                          'BCOM',     'SOB',  4, '2'),
            ('Bachelor of Education (Arts)',                  'BEDS',     'SOE',  4, '2'),
        ]
        self.programmes = {}
        for name, code, dept_code, years, sems in data:
            prog, _ = Programme.objects.get_or_create(
                code=code,
                defaults={
                    'name': name,
                    'department': self.departments[dept_code],
                    'duration_years': years,
                    'semesters_per_year': sems,
                }
            )
            self.programmes[code] = prog

        self._ok('Programmes', ', '.join(self.programmes.keys()))

    # ─────────────────────────────────────────────
    # ACADEMIC YEARS
    # ─────────────────────────────────────────────
    def _seed_academic_years(self):
        from core.models import AcademicYear

        years_data = [
            ('2023/2024', date(2023, 9, 1),  date(2024, 8, 31),  False),
            ('2024/2025', date(2024, 9, 1),  date(2025, 8, 31),  False),
            ('2025/2026', date(2025, 9, 1),  date(2026, 8, 31),  True),   # ← active
        ]
        self.academic_years = {}
        for name, start, end, active in years_data:
            ay, _ = AcademicYear.objects.get_or_create(
                name=name,
                defaults={'start_date': start, 'end_date': end, 'is_active': active}
            )
            self.academic_years[name] = ay

        self.active_year = self.academic_years['2025/2026']
        self._ok('Academic Years', '2023/2024 · 2024/2025 · 2025/2026 (active)')

    # ─────────────────────────────────────────────
    # SEMESTERS
    # ─────────────────────────────────────────────
    def _seed_semesters(self):
        from core.models import Semester

        # For 2025/2026 active year — create all year/semester combinations for year 1-4
        # Two groups: 2-sem programmes (year 1-4, sem 1-2) and 3-sem programmes (year 1-4, sem 1-3)
        self.semesters = {}
        ay = self.active_year

        # Year 1 Sem 1 is the currently active semester with open registration
        configs = [
            # (year, sem, start_offset_days, duration_days, is_active, reg_open)
            (1, 1, 0,   120, True,  True),   # current
            (1, 2, 130, 120, False, False),
            (2, 1, 260, 120, False, False),
            (2, 2, 390, 120, False, False),
            (3, 1, 0,   120, True,  True),   # also active for year 3
            (3, 2, 130, 120, False, False),
            (4, 1, 0,   120, True,  True),
            (4, 2, 130, 120, False, False),
        ]

        base = ay.start_date
        for year, sem, offset, duration, active, reg_open in configs:
            start = base + timedelta(days=offset)
            end = start + timedelta(days=duration)
            obj, _ = Semester.objects.get_or_create(
                academic_year=ay,
                year_of_study=year,
                semester_number=sem,
                defaults={
                    'start_date': start,
                    'end_date': end,
                    'is_active': active,
                    'registration_open': reg_open,
                }
            )
            self.semesters[(year, sem)] = obj

        # Nursing also needs semester 3 for each year
        for year in range(1, 5):
            start = base + timedelta(days=260)
            end = start + timedelta(days=100)
            obj, _ = Semester.objects.get_or_create(
                academic_year=ay,
                year_of_study=year,
                semester_number=3,
                defaults={
                    'start_date': start,
                    'end_date': end,
                    'is_active': False,
                    'registration_open': False,
                }
            )
            self.semesters[(year, 3)] = obj

        self._ok('Semesters', f'{Semester.objects.filter(academic_year=ay).count()} semesters for 2025/2026')

    # ─────────────────────────────────────────────
    # UNITS
    # ─────────────────────────────────────────────
    def _seed_units(self):
        from core.models import Unit

        ay = self.active_year

        # BSC IT units  — 4 years × 2 semesters
        bscit_units = {
            (1, 1): [('ICS 101', 'Introduction to Computing'),       ('MAT 101', 'Calculus I'),
                     ('ICS 102', 'Programming Fundamentals'),        ('COM 101', 'Communication Skills'),
                     ('ICS 103', 'Computer Organisation')],
            (1, 2): [('ICS 111', 'Object Oriented Programming'),     ('MAT 111', 'Discrete Mathematics'),
                     ('ICS 112', 'Data Structures'),                 ('ICS 113', 'Web Technologies I'),
                     ('ICS 114', 'Operating Systems I')],
            (2, 1): [('ICS 201', 'Database Systems I'),              ('ICS 202', 'Computer Networks I'),
                     ('ICS 203', 'Software Engineering I'),          ('MAT 201', 'Statistics'),
                     ('ICS 204', 'System Analysis & Design')],
            (2, 2): [('ICS 211', 'Database Systems II'),             ('ICS 212', 'Computer Networks II'),
                     ('ICS 213', 'Operating Systems II'),            ('ICS 214', 'Web Technologies II'),
                     ('ICS 215', 'Human Computer Interaction')],
            (3, 1): [('ICS 301', 'Software Engineering II'),         ('ICS 302', 'Information Security'),
                     ('ICS 303', 'Cloud Computing'),                 ('ICS 304', 'Mobile Development'),
                     ('ICS 305', 'Artificial Intelligence')],
            (3, 2): [('ICS 311', 'Distributed Systems'),             ('ICS 312', 'Data Warehousing'),
                     ('ICS 313', 'IT Project Management'),           ('ICS 314', 'Machine Learning'),
                     ('ICS 315', 'Research Methods')],
            (4, 1): [('ICS 401', 'Final Year Project I'),            ('ICS 402', 'Entrepreneurship in IT'),
                     ('ICS 403', 'DevOps & CI/CD'),                  ('ICS 404', 'Blockchain Technology'),
                     ('ICS 405', 'Advanced Database Systems')],
            (4, 2): [('ICS 411', 'Final Year Project II'),           ('ICS 412', 'IT Ethics & Governance'),
                     ('ICS 413', 'Internet of Things'),              ('ICS 414', 'Big Data Analytics'),
                     ('ICS 415', 'Software Testing')],
        }

        # BSC Nursing  — 4 years × 3 semesters (sample)
        nursing_units = {
            (1, 1): [('NUR 101', 'Anatomy & Physiology I'),          ('NUR 102', 'Introduction to Nursing'),
                     ('NUR 103', 'Communication in Healthcare'),     ('NUR 104', 'Biochemistry I')],
            (1, 2): [('NUR 111', 'Anatomy & Physiology II'),         ('NUR 112', 'Fundamentals of Nursing'),
                     ('NUR 113', 'Nutrition & Dietetics'),           ('NUR 114', 'Microbiology')],
            (1, 3): [('NUR 121', 'Medical Surgical Nursing I'),      ('NUR 122', 'Pharmacology I'),
                     ('NUR 123', 'Health Assessment'),               ('NUR 124', 'Research Methods')],
            (2, 1): [('NUR 201', 'Maternal & Child Health I'),       ('NUR 202', 'Community Health Nursing'),
                     ('NUR 203', 'Pharmacology II'),                 ('NUR 204', 'Pathophysiology')],
            (2, 2): [('NUR 211', 'Paediatric Nursing'),              ('NUR 212', 'Mental Health Nursing'),
                     ('NUR 213', 'Medical Surgical Nursing II'),     ('NUR 214', 'Ethics in Nursing')],
            (2, 3): [('NUR 221', 'Perioperative Nursing'),           ('NUR 222', 'Emergency Nursing'),
                     ('NUR 223', 'Clinical Placement I'),            ('NUR 224', 'Nursing Informatics')],
        }

        count = 0
        for (year, sem), unit_list in bscit_units.items():
            for code, name in unit_list:
                Unit.objects.get_or_create(
                    code=code, programme=self.programmes['BSCIT'], academic_year=ay,
                    defaults={'name': name, 'year_of_study': year, 'semester_number': sem,
                              'credit_hours': 3, 'is_active': True}
                )
                count += 1

        for (year, sem), unit_list in nursing_units.items():
            for code, name in unit_list:
                Unit.objects.get_or_create(
                    code=code, programme=self.programmes['BSCNURS'], academic_year=ay,
                    defaults={'name': name, 'year_of_study': year, 'semester_number': sem,
                              'credit_hours': 3, 'is_active': True}
                )
                count += 1

        # A few BCOM units for variety
        bcom_units_y1s1 = [
            ('BCO 101', 'Principles of Economics'), ('BCO 102', 'Business Mathematics'),
            ('BCO 103', 'Financial Accounting I'),  ('BCO 104', 'Business Communication'),
            ('BCO 105', 'Entrepreneurship'),
        ]
        for code, name in bcom_units_y1s1:
            Unit.objects.get_or_create(
                code=code, programme=self.programmes['BCOM'], academic_year=ay,
                defaults={'name': name, 'year_of_study': 1, 'semester_number': 1,
                          'credit_hours': 3, 'is_active': True}
            )
            count += 1

        self._ok('Units', f'{count} units created across BSCIT, BSCNURS, BCOM')

    # ─────────────────────────────────────────────
    # LECTURERS
    # ─────────────────────────────────────────────
    def _seed_lecturers(self):
        from core.models import User
        from lecturers.models import Lecturer

        lecturers_data = [
            ('LEC001', 'James',   'Mwangi',   '0712000001', 'j.mwangi@uni.ac.ke',   'lec@2025'),
            ('LEC002', 'Grace',   'Akinyi',   '0712000002', 'g.akinyi@uni.ac.ke',   'lec@2025'),
            ('LEC003', 'Peter',   'Kamau',    '0712000003', 'p.kamau@uni.ac.ke',    'lec@2025'),
            ('LEC004', 'Sarah',   'Njoroge',  '0712000004', 's.njoroge@uni.ac.ke',  'lec@2025'),
            ('LEC005', 'David',   'Ochieng',  '0712000005', 'd.ochieng@uni.ac.ke',  'lec@2025'),
            ('LEC006', 'Mary',    'Wanjiku',  '0712000006', 'm.wanjiku@uni.ac.ke',  'lec@2025'),
        ]
        self.lecturers = {}
        for staff_id, first, last, phone, email, pwd in lecturers_data:
            user, created = User.objects.get_or_create(
                username=staff_id,
                defaults={'role': 'lecturer', 'email': email}
            )
            if created:
                user.set_password(pwd)
                user.save()
            lec, _ = Lecturer.objects.get_or_create(
                staff_id=staff_id,
                defaults={'user': user, 'first_name': first, 'last_name': last, 'phone': phone}
            )
            self.lecturers[staff_id] = lec

        self._ok('Lecturers', ' · '.join(self.lecturers.keys()))

    # ─────────────────────────────────────────────
    # STUDENTS
    # ─────────────────────────────────────────────
    def _seed_students(self):
        from core.models import User
        from students.models import Student

        # Format: (reg_number, kcse_index, first, middle, last, programme_code, year, sem, phone, id_no)
        students_data = [
            # Year 1 Sem 1 — BSCIT
            ('SC211/0530/2022', '0011/8278/2019', 'Alice',   'Wanjiru',  'Kamau',    'BSCIT',   1, 1, '0701111001', '35000001'),
            ('SC211/0531/2022', '0011/8279/2019', 'Brian',   'Otieno',   'Odhiambo', 'BSCIT',   1, 1, '0701111002', '35000002'),
            ('SC211/0532/2022', '0011/8280/2019', 'Carol',   'Njeri',    'Muthoni',  'BSCIT',   1, 1, '0701111003', '35000003'),
            ('SC211/0533/2022', '0011/8281/2019', 'Dennis',  'Kipchoge', 'Ruto',     'BSCIT',   1, 1, '0701111004', '35000004'),
            ('SC211/0534/2022', '0011/8282/2019', 'Esther',  'Auma',     'Ochieng',  'BSCIT',   1, 1, '0701111005', '35000005'),
            # Year 1 Sem 1 — BSCIT (continued)
            ('SC211/0535/2022', '0011/8283/2019', 'Felix',   'Mutua',    'Mwenda',   'BSCIT',   1, 1, '0701111006', '35000006'),
            # Year 2 Sem 1 — BSCIT
            ('SC210/0200/2021', '0010/7100/2018', 'George',  'Waweru',   'Njoroge',  'BSCIT',   2, 1, '0701111007', '35000007'),
            ('SC210/0201/2021', '0010/7101/2018', 'Hannah',  'Adhiambo', 'Owino',    'BSCIT',   2, 1, '0701111008', '35000008'),
            # Year 3 Sem 1 — BSCIT
            ('SC209/0100/2020', '0009/6000/2017', 'Ivan',    'Koech',    'Kipkemoi', 'BSCIT',   3, 1, '0701111009', '35000009'),
            # Year 4 Sem 1 — BSCIT
            ('SC208/0050/2019', '0008/5000/2016', 'Jane',    'Chebet',   'Langat',   'BSCIT',   4, 1, '0701111010', '35000010'),
            # Year 1 Sem 1 — Nursing
            ('HS211/0100/2022', '0012/9000/2019', 'Kevin',   'Otieno',   'Abiero',   'BSCNURS', 1, 1, '0701111011', '35000011'),
            ('HS211/0101/2022', '0012/9001/2019', 'Linda',   'Nekesa',   'Barasa',   'BSCNURS', 1, 1, '0701111012', '35000012'),
            # BCOM
            ('BC211/0300/2022', '0013/9500/2019', 'Martin',  'Mbugua',   'Kariuki',  'BCOM',    1, 1, '0701111013', '35000013'),
        ]

        self.students = []
        for reg, kcse, first, middle, last, prog_code, year, sem, phone, id_no in students_data:
            user, created = User.objects.get_or_create(
                username=reg,
                defaults={'role': 'student'}
            )
            if created:
                user.set_password(kcse)
                user.save()
            st, _ = Student.objects.get_or_create(
                registration_number=reg,
                defaults={
                    'user': user,
                    'kcse_index': kcse,
                    'first_name': first,
                    'middle_name': middle,
                    'last_name': last,
                    'programme': self.programmes[prog_code],
                    'current_year_of_study': year,
                    'current_semester_number': sem,
                    'phone': phone,
                    'id_number': id_no,
                    'admission_date': date(2022, 9, 5),
                }
            )
            self.students.append(st)

        self._ok('Students', f'{len(self.students)} students across BSCIT, BSCNURS, BCOM')

    # ─────────────────────────────────────────────
    # FEE STRUCTURES
    # ─────────────────────────────────────────────
    def _seed_fee_structures(self):
        from students.models import FeeStructure

        ay = self.active_year
        fee_data = [
            # (programme_code, year, sem, amount)
            ('BSCIT',   1, 1, 52000), ('BSCIT',   1, 2, 52000),
            ('BSCIT',   2, 1, 55000), ('BSCIT',   2, 2, 55000),
            ('BSCIT',   3, 1, 55000), ('BSCIT',   3, 2, 55000),
            ('BSCIT',   4, 1, 55000), ('BSCIT',   4, 2, 55000),
            ('BSCNURS', 1, 1, 65000), ('BSCNURS', 1, 2, 65000), ('BSCNURS', 1, 3, 65000),
            ('BSCNURS', 2, 1, 68000), ('BSCNURS', 2, 2, 68000), ('BSCNURS', 2, 3, 68000),
            ('BCOM',    1, 1, 48000), ('BCOM',    1, 2, 48000),
        ]
        for prog_code, year, sem, amount in fee_data:
            FeeStructure.objects.get_or_create(
                programme=self.programmes[prog_code],
                academic_year=ay,
                year_of_study=year,
                semester_number=sem,
                defaults={'amount': amount}
            )

        self._ok('Fee Structures', f'{len(fee_data)} fee entries created')

    # ─────────────────────────────────────────────
    # UNIT ALLOCATIONS
    # ─────────────────────────────────────────────
    def _seed_allocations(self):
        from core.models import Unit
        from lecturers.models import UnitAllocation

        ay = self.active_year
        sem_y1s1 = self.semesters.get((1, 1))
        sem_y2s1 = self.semesters.get((2, 1))
        sem_y3s1 = self.semesters.get((3, 1))
        sem_y4s1 = self.semesters.get((4, 1))

        lec_ids = list(self.lecturers.keys())

        alloc_data = [
            # (unit_code, prog_code, semester_obj, lecturer_staff_id)
            ('ICS 101', 'BSCIT', sem_y1s1, 'LEC001'),
            ('MAT 101', 'BSCIT', sem_y1s1, 'LEC002'),
            ('ICS 102', 'BSCIT', sem_y1s1, 'LEC001'),
            ('COM 101', 'BSCIT', sem_y1s1, 'LEC003'),
            ('ICS 103', 'BSCIT', sem_y1s1, 'LEC004'),
            ('ICS 201', 'BSCIT', sem_y2s1, 'LEC001'),
            ('ICS 202', 'BSCIT', sem_y2s1, 'LEC005'),
            ('ICS 203', 'BSCIT', sem_y2s1, 'LEC003'),
            ('ICS 301', 'BSCIT', sem_y3s1, 'LEC001'),
            ('ICS 302', 'BSCIT', sem_y3s1, 'LEC004'),
            ('ICS 401', 'BSCIT', sem_y4s1, 'LEC002'),
            ('ICS 402', 'BSCIT', sem_y4s1, 'LEC005'),
            ('NUR 101', 'BSCNURS', sem_y1s1, 'LEC006'),
            ('NUR 102', 'BSCNURS', sem_y1s1, 'LEC006'),
            ('NUR 201', 'BSCNURS', sem_y2s1, 'LEC006'),
        ]

        count = 0
        for unit_code, prog_code, sem, staff_id in alloc_data:
            if sem is None:
                continue
            unit = Unit.objects.filter(code=unit_code, programme=self.programmes[prog_code]).first()
            lecturer = self.lecturers.get(staff_id)
            if unit and lecturer:
                _, created = UnitAllocation.objects.get_or_create(
                    lecturer=lecturer, unit=unit, semester=sem
                )
                if created:
                    count += 1

        self._ok('Unit Allocations', f'{count} allocations created')

    # ─────────────────────────────────────────────
    # SEMESTER REPORTS  (some approved, some pending)
    # ─────────────────────────────────────────────
    def _seed_semester_reports(self):
        from students.models import SemesterReporting
        from core.models import User

        ict_user = User.objects.filter(username='admin').first()
        sem_y1s1 = self.semesters.get((1, 1))
        sem_y2s1 = self.semesters.get((2, 1))
        sem_y3s1 = self.semesters.get((3, 1))
        sem_y4s1 = self.semesters.get((4, 1))

        count = 0
        for student in self.students:
            y = student.current_year_of_study
            s = student.current_semester_number
            sem = self.semesters.get((y, s))
            if not sem:
                continue
            # First 8 students are fully approved, rest are pending
            approved = self.students.index(student) < 8
            _, created = SemesterReporting.objects.get_or_create(
                student=student,
                semester=sem,
                defaults={
                    'approved': approved,
                    'approved_by': ict_user if approved else None,
                }
            )
            if created:
                count += 1

        self._ok('Semester Reports', f'{count} reports submitted ({min(8, len(self.students))} approved)')

    # ─────────────────────────────────────────────
    # UNIT REGISTRATIONS
    # ─────────────────────────────────────────────
    def _seed_unit_registrations(self):
        from core.models import Unit
        from students.models import UnitRegistration, SemesterReporting

        count = 0
        for student in self.students:
            y = student.current_year_of_study
            s = student.current_semester_number
            sem = self.semesters.get((y, s))
            if not sem:
                continue
            # Only register for approved reporters
            approved = SemesterReporting.objects.filter(
                student=student, semester=sem, approved=True
            ).exists()
            if not approved:
                continue

            units = Unit.objects.filter(
                programme=student.programme,
                year_of_study=y,
                semester_number=s,
                is_active=True,
            )
            for unit in units:
                _, created = UnitRegistration.objects.get_or_create(
                    student=student, unit=unit, semester=sem,
                    defaults={'status': 'registered'}
                )
                if created:
                    count += 1

        self._ok('Unit Registrations', f'{count} unit registrations created')

    # ─────────────────────────────────────────────
    # MARKS  (for approved + registered students)
    # ─────────────────────────────────────────────
    def _seed_marks(self):
        from core.models import User
        from students.models import UnitRegistration, Mark

        lec_user = User.objects.filter(username='LEC001').first()

        # Only seed marks for first 6 students to simulate partial upload
        target_students = [s for s in self.students[:6]]
        reg_numbers = [s.registration_number for s in target_students]

        registrations = UnitRegistration.objects.filter(
            student__registration_number__in=reg_numbers,
            status='registered'
        ).select_related('student', 'unit', 'semester')

        count = 0
        for reg in registrations:
            cat = round(random.uniform(12, 28), 1)
            exam = round(random.uniform(28, 65), 1)
            _, created = Mark.objects.get_or_create(
                student=reg.student,
                unit=reg.unit,
                semester=reg.semester,
                defaults={
                    'cat_score': cat,
                    'exam_score': exam,
                    'uploaded_by': lec_user,
                }
            )
            if created:
                count += 1

        self._ok('Marks', f'{count} mark records uploaded')

    # ─────────────────────────────────────────────
    # FEE PAYMENTS
    # ─────────────────────────────────────────────
    def _seed_fee_payments(self):
        from students.models import FeePayment, FeeBalance

        ay = self.active_year
        mpesa_codes = [
            'QGH4A1B2C3', 'PBK9X8Y7Z6', 'RCL3M4N5P6', 'SGJ7Q8R9S0',
            'TDK2W3X4Y5', 'UEL6A7B8C9', 'VFM1D2E3F4', 'WGN5H6I7J8',
        ]

        count = 0
        for i, student in enumerate(self.students[:8]):
            y = student.current_year_of_study
            s = student.current_semester_number
            sem = self.semesters.get((y, s))
            if not sem:
                continue

            # Vary amounts: some full, some partial, one overpayment
            expected = 52000
            if i == 0:
                amount = 52000   # full
            elif i == 1:
                amount = 55000   # overpayment
            elif i < 5:
                amount = 30000   # partial
            else:
                amount = 52000

            payment, created = FeePayment.objects.get_or_create(
                student=student,
                transaction_code=mpesa_codes[i % len(mpesa_codes)],
                defaults={
                    'academic_year': ay,
                    'semester': sem,
                    'amount_paid': amount,
                    'status': 'confirmed' if i < 6 else 'pending',
                }
            )

            if created:
                count += 1
                # Create/update fee balance for confirmed payments
                if payment.status == 'confirmed':
                    balance, _ = FeeBalance.objects.get_or_create(
                        student=student,
                        semester=sem,
                        defaults={'expected_amount': expected, 'paid_amount': 0}
                    )
                    balance.paid_amount += amount
                    if balance.paid_amount > balance.expected_amount:
                        extra = balance.paid_amount - balance.expected_amount
                        balance.carried_forward = extra
                        balance.paid_amount = balance.expected_amount
                    balance.save()

        self._ok('Fee Payments', f'{count} payment records created')

    # ─────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────
    def _ok(self, label, detail):
        self.stdout.write(
            f"  {self.style.SUCCESS('✔')}  {self.style.MIGRATE_LABEL(label):<28} {detail}"
        )

    def _print_login_summary(self):
        self.stdout.write(self.style.MIGRATE_HEADING('═══════════════════════════════════════════════'))
        self.stdout.write(self.style.MIGRATE_HEADING('  Demo Login Credentials'))
        self.stdout.write(self.style.MIGRATE_HEADING('═══════════════════════════════════════════════'))
        rows = [
            ('ICT Admin',  'admin',            'admin123',       'Full system access'),
            ('ICT Admin',  'ICT001',            'ict@2025',       'ICT officer'),
            ('Lecturer',   'LEC001',            'lec@2025',       'James Mwangi (IT dept)'),
            ('Lecturer',   'LEC002',            'lec@2025',       'Grace Akinyi'),
            ('Student',    'SC211/0530/2022',   '0011/8278/2019', 'Alice Kamau — BSCIT Y1 S1'),
            ('Student',    'SC211/0531/2022',   '0011/8279/2019', 'Brian Odhiambo — BSCIT Y1 S1'),
            ('Student',    'SC210/0200/2021',   '0010/7100/2018', 'George Njoroge — BSCIT Y2 S1'),
            ('Student',    'HS211/0100/2022',   '0012/9000/2019', 'Kevin Abiero — Nursing Y1 S1'),
        ]
        self.stdout.write(f"  {'Role':<12} {'Username':<24} {'Password':<20} {'Note'}")
        self.stdout.write(f"  {'─'*12} {'─'*24} {'─'*20} {'─'*30}")
        for role, username, password, note in rows:
            self.stdout.write(
                f"  {self.style.WARNING(role):<21} "
                f"{self.style.SUCCESS(username):<33} "
                f"{password:<20} "
                f"{self.style.HTTP_INFO(note)}"
            )
        self.stdout.write('')