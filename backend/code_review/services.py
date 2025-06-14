import google.generativeai as genai
import json
import re
from django.conf import settings
from typing import Dict, List, Any

class GeminiCodeReviewService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('models/gemini-2.0-flash')
    
    def create_review_prompt(self, code: str, language: str) -> str:
        """Create a detailed prompt for code review"""
        return f"""
You are an expert code reviewer with years of experience in {language} development. 
Review the following {language} code and provide detailed feedback.

Please respond with a JSON object containing exactly these fields:
1. "summary": A brief summary of what this code does (2-3 sentences)
2. "suggestions": An array of improvement suggestions, each with:
   - "type": one of "performance", "security", "readability", "best_practices"
   - "icon": appropriate emoji (⚡ for performance, 🔒 for security, 📖 for readability, ⭐ for best practices)
   - "title": brief title
   - "description": detailed explanation
3. "line_comments": An array of line-specific comments, each with:
   - "line": line number (starting from 1)
   - "comment": specific feedback for that line
   - "type": one of "suggestion", "improvement", "praise", "warning"

Focus on:
- Code quality and maintainability
- Performance optimizations
- Security vulnerabilities
- Best practices for {language}
- Readability improvements
- Potential bugs or edge cases

Here is the code to review:

```{language}
{code}
```

Respond only with valid JSON, no additional text.
"""

    def parse_ai_response(self, response_text: str) -> Dict[str, Any]:
            """Parse AI response and extract structured data"""
            try:
                # Try to extract JSON from the response
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    json_str = json_match.group()
                    return json.loads(json_str)
                else:
                    # Fallback: try to parse entire response as JSON
                    return json.loads(response_text)
            except json.JSONDecodeError:
                # Fallback response if JSON parsing fails
                return {
                    "summary": "Code analysis completed. The AI response could not be parsed properly.",
                    "suggestions": [
                        {
                            "type": "general",
                            "icon": "🤖",
                            "title": "AI Analysis",
                            "description": "The code has been analyzed, but detailed suggestions are not available due to parsing issues."
                        }
                    ],
                    "line_comments": [
                        {
                            "line": 1,
                            "comment": "General feedback: Consider reviewing code structure and best practices.",
                            "type": "suggestion"
                        }
                    ]
                }
        
    def review_code(self, code: str, language: str) -> Dict[str, Any]:
            """Main method to review code using Gemini AI"""
            try:
                prompt = self.create_review_prompt(code, language)
                response = self.model.generate_content(prompt)
                
                if response.text:
                    return self.parse_ai_response(response.text)
                else:
                    raise Exception("Empty response from AI model")
                    
            except Exception as e:
                # Fallback response for any errors
                return {
                    "summary": f"Unable to complete code review: {str(e)}",
                    "suggestions": [
                        {
                            "type": "error",
                            "icon": "⚠️",
                            "title": "Review Error",
                            "description": "There was an issue analyzing your code. Please try again."
                        }
                    ],
                    "line_comments": []
                }
