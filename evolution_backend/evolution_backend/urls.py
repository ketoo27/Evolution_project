from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def test_view(request):
    return HttpResponse("Test view is working!")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')), # REST framework browsable API URLs
    path('api/', include('kanbanapi.urls')), # Include URLs from your kanbanapi app under /api/
    path('test-url/', test_view),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)