# UniManage — University Management System

A full-stack university management system with three role-based portals: **Student**, **Lecturer**, and **ICT Admin**. Built with Django REST Framework + React (Vite).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2, Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Frontend | React 18, React Router v6, Vite |
| HTTP Client | Axios |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Styling | CSS Variables + Custom Design System |

---

## Project Structure

```
university_system/
│
├── backend/
│   ├── requirements.txt
│   ├── manage.py
│   │
│   ├── university_backend/
│   │   ├── settings.py              # Django config, JWT, CORS, installed apps
│   │   ├── urls.py                  # Root: api/ → all app urls
│   │   └── wsgi.py
│   │
│   ├── core/                        # Shared models & authentication
│   │   ├── models.py                # User, Department, Programme, AcademicYear, Semester, Unit
│   │   ├── serializers.py           # Login, Programme, Semester, Unit serializers
│   │   ├── views.py                 # login_view, me_view, CRUD viewsets
│   │   └── urls.py                  # /api/auth/ → login, token/refresh, me, programmes, semesters, units
│   │
│   ├── students/                    # Student portal backend
│   │   ├── models.py                # Student, FeeStructure, FeePayment, FeeBalance,
│   │   │                            #   SemesterReporting, UnitRegistration, Mark
│   │   ├── serializers.py
│   │   ├── views.py                 # Dashboard, unit registration, fee payment, marks
│   │   └── urls.py                  # /api/students/ → profiles, fee-payments, marks, unit-registrations
│   │
│   ├── lecturers/                   # Lecturer portal backend
│   │   ├── models.py                # Lecturer, UnitAllocation, Note
│   │   ├── serializers.py
│   │   ├── views.py                 # Dashboard, upload marks, upload notes
│   │   └── urls.py                  # /api/lecturers/ → profiles, allocations, notes, marks
│   │
│   └── ict_admin/                   # ICT Admin portal backend
│       ├── models.py                # SystemLog
│       ├── views.py                 # Dashboard, user management, approvals, fee confirmation
│       └── urls.py                  # /api/ict/ → dashboard, users, semester-reports, fee-payments, logs
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx                 # Entry point
        ├── App.jsx                  # React Router + protected routes (role-based)
        │
        ├── services/
        │   └── api.js               # Axios instance + authAPI, coreAPI, studentAPI, lecturerAPI, ictAPI
        │
        ├── styles/
        │   └── globalStyle.css      # CSS variables, utility classes (btn, badge, card, table, modal)
        │
        ├── components/
        │   └── common/
        │       ├── Layout.jsx        # Wraps Sidebar + main content area
        │       ├── Layout.css
        │       ├── Sidebar.jsx       # Role-aware navigation sidebar
        │       └── Sidebar.css
        │
        └── pages/
            ├── Login.jsx             # Single login page → redirects by role
            ├── Login.css
            │
            ├── student/
            │   ├── Dashboard.jsx     # Fee balance, registered units, semester report
            │   ├── UnitRegistration.jsx  # Register/drop units (gated by reporting + reg open)
            │   ├── Marks.jsx         # View CAT, exam, total, grade per unit
            │   ├── Notes.jsx         # View notes uploaded by lecturers
            │   ├── Fees.jsx          # Submit payment, view history + balance
            │   └── Profile.jsx       # Personal details
            │
            ├── lecturer/
            │   ├── Dashboard.jsx     # Overview of allocated units
            │   ├── UploadMarks.jsx   # Select unit → enter CAT + exam per student
            │   ├── UploadNotes.jsx   # Upload/delete study notes per unit
            │   └── Profile.jsx
            │
            └── ict/
                ├── Dashboard.jsx     # System stats + recent audit logs
                ├── Students.jsx      # Create + list students
                ├── Lecturers.jsx     # Create + list lecturers
                ├── Programmes.jsx    # Create programmes (2 or 3 sem/year)
                ├── Semesters.jsx     # Create semesters, toggle active + reg open
                ├── Allocations.jsx   # Assign lecturers to units per semester
                ├── SemesterReports.jsx  # Approve/reject student semester reports
                ├── Payments.jsx      # Confirm/reject fee payments
                └── Logs.jsx          # Full system audit trail
```

---

## API Endpoints Overview

| Base | Description |
|---|---|
| `POST /api/auth/login/` | Role-based login → returns JWT + role |
| `GET  /api/auth/me/` | Current user info |
| `GET  /api/auth/programmes/` | List all programmes |
| `GET  /api/auth/semesters/` | List semesters (filter by academic year) |
| `GET  /api/auth/units/` | List units (filter by programme/year/semester) |
| `GET  /api/students/profiles/dashboard/` | Student dashboard data |
| `POST /api/students/semester-reporting/` | Student reports for semester |
| `POST /api/students/unit-registrations/` | Register a unit |
| `GET  /api/students/marks/` | Student's marks |
| `POST /api/students/fee-payments/` | Submit fee payment |
| `GET  /api/lecturers/profiles/dashboard/` | Lecturer dashboard |
| `POST /api/lecturers/marks/` | Upload student mark |
| `POST /api/lecturers/notes/` | Upload study note |
| `GET  /api/ict/dashboard/` | System-wide stats |
| `POST /api/ict/users/create-student/` | Create student account |
| `POST /api/ict/users/create-lecturer/` | Create lecturer account |
| `POST /api/ict/semester-reports/{id}/approve/` | Approve semester report |
| `POST /api/ict/fee-payments/{id}/confirm/` | Confirm fee payment |

---

## Login Credentials Format

| Role | Username | Password |
|---|---|---|
| Student | Registration No. e.g. `SC211/0530/2022` | KCSE Index e.g. `0011/8278/2019` |
| Lecturer | Staff ID e.g. `LEC001` | Password set by ICT admin |
| ICT Admin | Staff ID / username | Password set at creation |

---

## Key Business Rules

- **Semester Reporting**: Students must report for a semester and be approved by ICT before registering units.
- **Unit Registration**: Students can only register units matching their current `year_of_study` and `semester_number`. Registration must also be open (`Semester.registration_open = True`).
- **Programme Flexibility**: BSc IT = 4 years × 2 semesters. Nursing = 4 years × 3 semesters. Configurable per programme.
- **Curriculum Revision**: Units are linked to both a programme and an `AcademicYear`, allowing year-specific curriculum updates.
- **Fee Overpayment**: If a student pays more than their expected fee, the excess is recorded as `carried_forward` and pushed to the next semester.
- **Marks**: CAT is out of 30, Exam out of 70. Grade is auto-computed on save.

---

## Setup — Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py makemigrations core students lecturers ict_admin
python manage.py migrate
python manage.py createsuperuser   # creates ICT admin user (set role='ict')
python manage.py runserver
```

## Setup — Frontend

```bash
cd frontend
npm install
npm run dev        # runs on http://localhost:3000
```

> Set `VITE_API_URL=http://localhost:8000/api` in a `.env` file or it defaults to that value.