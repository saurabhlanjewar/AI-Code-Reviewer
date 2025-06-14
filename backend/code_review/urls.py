from django.urls import path
from . import views

urlpatterns = [
    path('review/', views.review_code, name='review_code'),
    # path('history/', views.get_review_history, name='review_history'),
]