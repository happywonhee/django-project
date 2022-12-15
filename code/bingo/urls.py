from django.contrib import admin
from django.urls import path,include
from . import views

app_name='bingo'
urlpatterns =[
    path('detail1/',views.Detail1,name='detail1'),
    path('detail2/',views.Detail2,name='detail2'),
    path('detail3/',views.Detail3,name='detail3'),
    path('',views.Bingo,name='bingo')
]