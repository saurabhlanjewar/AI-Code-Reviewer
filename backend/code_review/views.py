from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, renderer_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer, BrowsableAPIRenderer
from .serializers import CodeReviewSerializer, CodeReviewResponseSerializer
from .services import GeminiCodeReviewService

@api_view(['POST'])
@permission_classes([AllowAny])
@renderer_classes([JSONRenderer, BrowsableAPIRenderer])
def review_code(request):
    """
    API endpoint to review code using AI
    """
    try:
        # Validate input data
        serializer = CodeReviewSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid input data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        code = serializer.validated_data['code']
        language = serializer.validated_data['language']
        
        # Validate code length (prevent abuse)
        if len(code) > 10000:  # 10KB limit
            return Response(
                {'error': 'Code too long. Maximum 10,000 characters allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize AI service and get review
        ai_service = GeminiCodeReviewService()
        review_result = ai_service.review_code(code, language)
        
        # Return structured response
        response_serializer = CodeReviewResponseSerializer(data=review_result)
        if response_serializer.is_valid():
            return Response({
                'summary': review_result['summary'],
                'suggestions': review_result['suggestions'],
                'lineComments': review_result['line_comments']  # Convert to camelCase for frontend
            }, status=status.HTTP_200_OK)
        else:
            return Response(
                {'error': 'Invalid AI response format'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except Exception as e:
        return Response(
            {'error': f'Internal server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# @api_view(['GET'])
# @permission_classes([AllowAny])
# @renderer_classes([JSONRenderer, BrowsableAPIRenderer])
# def get_review_history(request):
#     """
#     Get recent code reviews (optional feature)
#     """
#     try:
#         reviews = CodeReview.objects.all()[:10]  # Last 10 reviews
#         serializer = CodeReviewSerializer(reviews, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)
#     except Exception as e:
#         return Response(
#             {'error': f'Failed to fetch review history: {str(e)}'},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )
