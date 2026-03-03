from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('profiles', views.StudentViewSet, basename='student')
router.register('fee-structures', views.FeeStructureViewSet)
router.register('fee-payments', views.FeePaymentViewSet)
router.register('fee-balances', views.FeeBalanceViewSet)
router.register('semester-reporting', views.SemesterReportingViewSet)
router.register('unit-registrations', views.UnitRegistrationViewSet)
router.register('marks', views.MarkViewSet)

urlpatterns = [
    path('', include(router.urls)),
]