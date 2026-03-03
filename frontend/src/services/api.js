import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return api(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// AUTH
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  me: () => api.get('/auth/me/'),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// CORE
export const coreAPI = {
  getProgrammes: () => api.get('/auth/programmes/'),
  getAcademicYears: () => api.get('/auth/academic-years/'),
  getSemesters: (params) => api.get('/auth/semesters/', { params }),
  getUnits: (params) => api.get('/auth/units/', { params }),
  getDepartments: () => api.get('/auth/departments/'),
  createProgramme: (data) => api.post('/auth/programmes/', data),
  createAcademicYear: (data) => api.post('/auth/academic-years/', data),
  updateAcademicYear: (id, data) => api.patch(`/auth/academic-years/${id}/`, data),
  createSemester: (data) => api.post('/auth/semesters/', data),
  updateSemester: (id, data) => api.patch(`/auth/semesters/${id}/`, data),
  createUnit: (data) => api.post('/auth/units/', data),
  updateUnit: (id, data) => api.patch(`/auth/units/${id}/`, data),
};

// STUDENTS
export const studentAPI = {
  getProfile: () => api.get('/students/profiles/my-profile/'),
  getDashboard: () => api.get('/students/profiles/dashboard/'),
  updateProfile: (id, data) => api.patch(`/students/profiles/${id}/`, data),

  getFeePayments: () => api.get('/students/fee-payments/'),
  submitPayment: (data) => api.post('/students/fee-payments/', data),

  getFeeBalance: () => api.get('/students/fee-balances/'),

  reportSemester: (semesterId) => api.post('/students/semester-reporting/', { semester: semesterId }),
  getReports: () => api.get('/students/semester-reporting/'),

  getRegistrations: (params) => api.get('/students/unit-registrations/', { params }),
  registerUnit: (data) => api.post('/students/unit-registrations/', data),
  dropUnit: (id) => api.patch(`/students/unit-registrations/${id}/`, { status: 'dropped' }),

  getMarks: () => api.get('/students/marks/'),
  getNotes: (params) => api.get('/lecturers/notes/', { params }),
};

// LECTURERS
export const lecturerAPI = {
  getProfile: () => api.get('/lecturers/profiles/my-profile/'),
  getDashboard: () => api.get('/lecturers/profiles/dashboard/'),

  getNotes: (params) => api.get('/lecturers/notes/', { params }),
  uploadNote: (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([k, v]) => form.append(k, v));
    return api.post('/lecturers/notes/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteNote: (id) => api.delete(`/lecturers/notes/${id}/`),

  getMarks: (params) => api.get('/lecturers/marks/', { params }),
  getUnitStudents: (unit, semester) =>
    api.get('/lecturers/marks/unit-students/', { params: { unit, semester } }),
  uploadMark: (data) => api.post('/lecturers/marks/', data),
  updateMark: (id, data) => api.patch(`/lecturers/marks/${id}/`, data),
};

// ICT ADMIN
export const ictAPI = {
  getDashboard: () => api.get('/ict/dashboard/'),
  getLogs: () => api.get('/ict/logs/'),

  createStudent: (data) => api.post('/ict/users/create-student/', data),
  createLecturer: (data) => api.post('/ict/users/create-lecturer/', data),
  getAllStudents: () => api.get('/students/profiles/'),
  getAllLecturers: () => api.get('/lecturers/profiles/'),

  getAllocations: () => api.get('/lecturers/allocations/'),
  createAllocation: (data) => api.post('/lecturers/allocations/', data),
  deleteAllocation: (id) => api.delete(`/lecturers/allocations/${id}/`),

  getSemesterReports: (params) => api.get('/ict/semester-reports/', { params }),
  approveReport: (id) => api.post(`/ict/semester-reports/${id}/approve/`),
  rejectReport: (id) => api.post(`/ict/semester-reports/${id}/reject/`),

  getPayments: (params) => api.get('/ict/fee-payments/', { params }),
  confirmPayment: (id) => api.post(`/ict/fee-payments/${id}/confirm/`),
  rejectPayment: (id) => api.post(`/ict/fee-payments/${id}/reject/`),

  getProgrammes: () => api.get('/auth/programmes/'),
  getAcademicYears: () => api.get('/auth/academic-years/'),
  getSemesters: (params) => api.get('/auth/semesters/', { params }),
  createSemester: (data) => api.post('/auth/semesters/', data),
  updateSemester: (id, data) => api.patch(`/auth/semesters/${id}/`, data),
};

export default api;