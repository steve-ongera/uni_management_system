from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('logs', views.SystemLogViewSet)
router.register('users', views.UserManagementViewSet, basename='ict-users')
router.register('semester-reports', views.SemesterReportApprovalViewSet, basename='ict-semester-reports')
router.register('fee-payments', views.FeePaymentApprovalViewSet, basename='ict-fee-payments')
router.register('dashboard', views.ICTDashboardViewSet, basename='ict-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]