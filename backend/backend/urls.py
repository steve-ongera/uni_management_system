from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include('core.urls')),
        path('students/', include('students.urls')),
        path('lecturers/', include('lecturers.urls')),
        path('ict/', include('ict_admin.urls')),
    ])),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)