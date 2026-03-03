from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register('departments', views.DepartmentViewSet)
router.register('programmes', views.ProgrammeViewSet)
router.register('academic-years', views.AcademicYearViewSet)
router.register('semesters', views.SemesterViewSet)
router.register('units', views.UnitViewSet)

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', views.me_view, name='me'),
    path('', include(router.urls)),
]