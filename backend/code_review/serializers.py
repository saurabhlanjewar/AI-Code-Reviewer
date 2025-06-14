# code_review/serializers.py
from rest_framework import serializers
from .models import CodeReview

class CodeReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = CodeReview
        fields = ['id', 'code', 'language', 'summary', 'suggestions', 'line_comments', 'created_at']
        read_only_fields = ['id', 'summary', 'suggestions', 'line_comments', 'created_at']

class CodeReviewResponseSerializer(serializers.Serializer):
    summary = serializers.CharField()
    suggestions = serializers.ListField()
    line_comments = serializers.ListField()