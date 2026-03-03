from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('profiles', views.LecturerViewSet, basename='lecturer')
router.register('allocations', views.UnitAllocationViewSet)
router.register('notes', views.NoteViewSet)
router.register('marks', views.LecturerMarksViewSet, basename='lecturer-marks')

urlpatterns = [
    path('', include(router.urls)),
]