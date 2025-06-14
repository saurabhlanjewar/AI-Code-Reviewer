from django.contrib import admin
from .models import CodeReview

@admin.register(CodeReview)
class CodeReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'language', 'created_at', 'code_preview']
    list_filter = ['language', 'created_at']
    search_fields = ['code', 'summary']
    readonly_fields = ['created_at']
    
    def code_preview(self, obj):
        return obj.code[:50] + "..." if len(obj.code) > 50 else obj.code
    code_preview.short_description = 'Code Preview'