import React, { useState, useEffect, useRef } from 'react';
import { Code, FileText, CheckCircle, MessageCircle, Loader2, AlertCircle, Upload, Download, Copy, Trash2, Eye, EyeOff, Zap, Shield, BookOpen, Star } from 'lucide-react';
import axios from 'axios';
import { ENDPOINTS } from '../config';

const CodeReviewTool = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState(null);
  const [error, setError] = useState(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      // Default to dark mode, but can be overridden by system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark || true; // Always default to dark mode
    }
    return true; // Default to dark mode on server-side
  });
  const [copiedLine, setCopiedLine] = useState(null);
  
  // Refs for synchronized scrolling
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  // Add effect to listen for system color scheme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        // Only update if user hasn't manually toggled the theme
        if (!localStorage.getItem('themePreference')) {
          setIsDarkMode(e.matches || true); // Always default to dark mode
        }
      };

      // Add listener for changes
      mediaQuery.addEventListener('change', handleChange);

      // Cleanup
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  const languages = [
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '📄' },
    { value: 'typescript', label: 'TypeScript', icon: '📘' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚡' },
    { value: 'c', label: 'C', icon: '🔧' },
    { value: 'csharp', label: 'C#', icon: '💜' },
    { value: 'go', label: 'Go', icon: '🐹' },
    { value: 'rust', label: 'Rust', icon: '🦀' },
    { value: 'php', label: 'PHP', icon: '🐘' },
    { value: 'ruby', label: 'Ruby', icon: '💎' },
    { value: 'swift', label: 'Swift', icon: '🍎' },
    { value: 'kotlin', label: 'Kotlin', icon: '🤖' }
  ];

  const sampleCodes = {
    python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# This is inefficient - could use memoization
result = fibonacci(10)
print(result)`,
    javascript: `function fetchUserData(id) {
    return fetch('/api/users/' + id)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            return data;
        });
}

// Missing error handling
fetchUserData(123);`,
    java: `public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.add(5, 3));
    }
}`
  };

  // Enhanced mock AI review function
  const mockAIReview = async (code, language) => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const codeLines = code.split('\n').length;
    const complexity = code.length > 200 ? 'high' : code.length > 100 ? 'medium' : 'low';
    
    return {
      summary: `This ${language} code contains ${codeLines} lines and has ${complexity} complexity. The code ${code.includes('function') || code.includes('def') ? 'defines functions' : 'contains executable statements'} and ${code.includes('//') || code.includes('#') ? 'includes some comments' : 'lacks documentation'}.`,
      suggestions: [
        {
          type: 'performance',
          icon: '⚡',
          title: 'Performance Optimization', 
          description: code.includes('fibonacci') ? 'Consider using memoization to avoid redundant calculations in recursive functions.' : 'Consider optimizing loops and data structures for better performance.',
          severity: 'medium'
        },
        {
          type: 'security',
          icon: '🔒',
          title: 'Security Enhancement',
          description: code.includes('fetch') ? 'Add proper error handling and input validation for API calls.' : 'Validate all inputs and handle edge cases to prevent security issues.',
          severity: 'high'
        },
        {
          type: 'readability',
          icon: '📖',
          title: 'Code Readability',
          description: 'Add comprehensive docstrings/comments and use more descriptive variable names.',
          severity: 'low'
        },
        {
          type: 'best_practices',
          icon: '⭐',
          title: 'Best Practices',
          description: `Follow ${language} naming conventions and consider breaking large functions into smaller ones.`,
          severity: 'medium'
        }
      ],
      lineComments: [
        {
          line: Math.max(1, Math.floor(codeLines * 0.2)),
          comment: 'Consider adding type hints or documentation here.',
          type: 'suggestion',
          severity: 'low'
        },
        {
          line: Math.max(1, Math.floor(codeLines * 0.5)),
          comment: code.includes('return') ? 'Good use of return statement.' : 'This line looks well structured.',
          type: 'praise',
          severity: 'info'
        },
        {
          line: Math.max(1, Math.floor(codeLines * 0.8)),
          comment: 'Consider extracting this logic into a separate function for better maintainability.',
          type: 'improvement',
          severity: 'medium'
        }
      ]
    };
  };

  const handleReview = async () => {
    if (!code.trim()) {
      setError('Please enter some code to review');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReview(null);

    try {
      // Use the mock AI review function since ENDPOINTS is not defined
    //   const reviewData = await mockAIReview(code, language);
         const response = await axios.post(ENDPOINTS.REVIEW, {"code": code, "language":language});
        const reviewData = await response.data
      setReview(reviewData);
    } catch (err) {
      setError('Failed to review code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = () => {
    const sample = sampleCodes[language] || sampleCodes.python;
    setCode(sample);
    setReview(null);
    setError(null);
  };

  const handleCopyToClipboard = async (text, lineNumber = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (lineNumber) {
        setCopiedLine(lineNumber);
        setTimeout(() => setCopiedLine(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
        setReview(null);
        setError(null);
      };
      reader.readAsText(file);
    }
  };

  // Synchronized scroll handler
  const handleScroll = (event) => {
    const scrollTop = event.target.scrollTop;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  const getCommentTypeColor = (type) => {
    const baseColors = {
      suggestion: 'text-blue-700 bg-blue-50 border-blue-300',
      improvement: 'text-amber-700 bg-amber-50 border-amber-300',
      praise: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      warning: 'text-red-700 bg-red-50 border-red-300'
    };
    return baseColors[type] || 'text-gray-700 bg-gray-50 border-gray-300';
  };

  const getSeverityBadge = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      info: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[severity] || colors.info;
  };

  const getSuggestionIcon = (type) => {
    const icons = {
      performance: <Zap className="w-5 h-5" />,
      security: <Shield className="w-5 h-5" />,
      readability: <BookOpen className="w-5 h-5" />,
      best_practices: <Star className="w-5 h-5" />
    };
    return icons[type] || <Code className="w-5 h-5" />;
  };

  const renderCodeEditor = () => {
    const lines = code ? code.split('\n') : [''];
    const actualLineCount = lines.length;
    const minHeight = 15; // Minimum visible lines
    const maxHeight = 30; // Maximum visible lines before scrolling
    
    // Calculate container height based on content, with min/max limits
    const visibleLines = Math.max(minHeight, Math.min(maxHeight, actualLineCount));
    const containerHeight = visibleLines * 1.5; // 1.5rem per line
    
    return (
      <div className="flex font-mono text-sm relative max-h-[500px]" style={{ height: `${containerHeight}rem` }}>
        {/* Line Numbers */}
        {showLineNumbers && (
          <div className={`select-none text-right pr-4 py-2 border-r overflow-hidden ${
            isDarkMode ? 'text-gray-400 border-gray-600 bg-gray-800' : 'text-gray-500 border-gray-300 bg-gray-100'
          }`} style={{ minWidth: '3rem' }}>
            <div 
              ref={lineNumbersRef}
              className="overflow-y-auto h-full scrollbar-hidden" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {Array.from({ length: actualLineCount }, (_, index) => (
                <div key={index} className="leading-6 h-6">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Code Editor */}
        <div className="flex-1 relative overflow-hidden">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            placeholder={`Paste your ${language} code here...`}
            maxLength={50000} // Increased character limit
            className={`w-full h-full px-4 py-2 border-0 resize-none font-mono text-sm focus:ring-0 focus:outline-none bg-transparent overflow-y-auto custom-scrollbar ${
              isDarkMode 
                ? 'text-white placeholder-gray-500' 
                : 'text-gray-900 placeholder-gray-400'
            }`}
            style={{ 
              lineHeight: '1.5rem'
            }}
            spellCheck={false}
          />
        </div>
      </div>
    );
  };

  // Update theme toggle to store preference
  const handleThemeToggle = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('themePreference', newMode ? 'dark' : 'light');
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-violet-50 via-white to-purple-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-all duration-300">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            AI Peer Code Review
          </h1>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Get instant, intelligent feedback on your code quality, performance, and security with advanced AI-powered analysis
          </p>
          
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className={`mt-6 px-4 py-2 rounded-lg border transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700' 
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border p-8 transform hover:shadow-2xl transition-all duration-300 min-h-[90vh]`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
                <FileText className="w-8 h-8 mr-3 text-violet-600" />
                Code Input
              </h2>
              
              <div className="space-y-6">
                {/* Language Selection */}
                <div>
                  <label className={`block text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Programming Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {languages.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.icon} {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Code Input Area */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Your Code
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                        className={`p-2 rounded-lg transition-colors ${
                          showLineNumbers 
                            ? (isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700')
                            : (isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100')
                        }`}
                        title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
                      >
                        {showLineNumbers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <input
                        type="file"
                        accept=".txt,.js,.py,.java,.cpp,.c,.cs,.go,.rs,.php,.rb,.swift,.kt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Upload file"
                      >
                        <Upload className="w-4 h-4" />
                      </label>
                      <button
                        onClick={handleLoadSample}
                        className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Load Sample
                      </button>
                      <button
                        onClick={() => handleCopyToClipboard(code)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkMode 
                            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Copy all code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`border rounded-xl overflow-hidden ${
                    isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50'
                  }`}>
                    {renderCodeEditor()}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {code.split('\n').length} lines, {code.length}/50,000 characters
                    </span>
                    <button
                      onClick={() => setCode('')}
                      className={`p-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                      title="Clear code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Review Button */}
                <button
                  onClick={handleReview}
                  disabled={isLoading || !code.trim()}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing Code...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      <span>Review My Code</span>
                    </>
                  )}
                </button>

                {error && (
                  <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 animate-shake">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl shadow-xl border p-8 transform hover:shadow-2xl transition-all duration-300 min-h-[90vh]`}>
              <h2 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-6 flex items-center`}>
                <MessageCircle className="w-8 h-8 mr-3 text-violet-600" />
                Review Results
              </h2>

              {!review && !isLoading && (
                <div className="text-center py-16">
                  <div className={`w-32 h-32 mx-auto ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full flex items-center justify-center mb-6 animate-pulse`}>
                    <Code className={`w-16 h-16 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>
                    Submit your code for AI-powered review to see detailed analysis here
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-16">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 mx-auto animate-spin text-violet-600 mb-6" />
                    <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full border-4 border-violet-200 animate-ping"></div>
                  </div>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-lg font-medium`}>
                    AI is analyzing your code...
                  </p>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-2`}>
                    This may take a few moments
                  </p>
                </div>
              )}

              {review && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Summary Section */}
                  <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gradient-to-r from-violet-50 to-purple-50'} rounded-xl p-6 border ${isDarkMode ? 'border-gray-600' : 'border-violet-200'}`}>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3 flex items-center`}>
                      🧠 Code Summary
                    </h3>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>{review.summary}</p>
                  </div>

                  {/* Suggestions Section */}
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                      ✅ Improvement Suggestions
                    </h3>
                    <div className="space-y-4">
                      {review.suggestions.map((suggestion, index) => (
                        <div key={index} className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} border rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${
                              suggestion.type === 'performance' ? 'bg-yellow-100 text-yellow-600' :
                              suggestion.type === 'security' ? 'bg-red-100 text-red-600' :
                              suggestion.type === 'readability' ? 'bg-blue-100 text-blue-600' :
                              'bg-purple-100 text-purple-600'
                            }`}>
                              {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {suggestion.title}
                                </h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadge(suggestion.severity)}`}>
                                  {suggestion.severity}
                                </span>
                              </div>
                              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-sm leading-relaxed`}>
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Line Comments Section */}
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center`}>
                      💬 Line-by-Line Analysis
                    </h3>
                    <div className="space-y-3">
                      {review.lineComments.map((comment, index) => (
                        <div key={index} className={`border rounded-xl p-4 transition-all duration-300 hover:shadow-md ${getCommentTypeColor(comment.type)} ${isDarkMode ? 'border-opacity-50' : ''}`}>
                          <div className="flex items-start space-x-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 bg-white rounded-full text-sm font-bold shadow-sm ${
                              comment.type === 'praise' ? 'text-green-600' : 
                              comment.type === 'warning' ? 'text-red-600' : 
                              'text-blue-600'
                            }`}>
                              {comment.line}
                            </span>
                            <div className="flex-1">
                              <p className="font-medium text-sm leading-relaxed">{comment.comment}</p>
                              {comment.severity && (
                                <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getSeverityBadge(comment.severity)}`}>
                                  {comment.severity}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`text-center mt-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">Powered by Advanced AI • Secure & Private • No Code Stored</p>
          <p className="text-sm mt-2">Made with ❤️ for developers</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        /* Hide scrollbar for line numbers */
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        
        /* Custom scrollbar styles for textarea */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        /* Custom scrollbar styles */
        textarea::-webkit-scrollbar {
          width: 8px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: transparent;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 4px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
        
        /* Dark mode scrollbar */
        .bg-gray-900 textarea::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
        
        .bg-gray-900 textarea::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
      </div>
  );
};

export default CodeReviewTool;