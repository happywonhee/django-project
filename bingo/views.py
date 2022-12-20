from django.shortcuts import render

# Create your views here.

def Detail1(request):
    return render(request,'bingo/detail1.html')

def Detail2(request):
    return render(request,'bingo/detail2.html')

def Detail3(request):
    return render(request,'bingo/detail3.html')

def Detail4(request):
    return render(request,'bingo/detail4.html')

def Bingo(request):
    return render(request,'bingo/bingo.html')