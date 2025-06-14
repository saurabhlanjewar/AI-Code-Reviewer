# AI Peer Code Review Tool 
A smart and fast AI-powered code review assistant that helps developers get instant, structured feedback on their code using Google's Gemini Pro (free) API.

![image](https://github.com/user-attachments/assets/973055d9-5e48-4ddb-9319-408007f2a4ac)


## 🚀 Features

- 🧠 **AI-Powered Code Review**
  - Get a summary of what your code does
  - Suggestions for improvements (readability, performance, security)
  - Optional line-by-line feedback like a real code reviewer

- 🧾 **Multi-language Support**
  - Works with Python, JavaScript, Java, C++, and more

- ⚡ **Fast & Free**
  - Powered by Google Gemini API (no OpenAI cost)

- 🌐 **Web UI**
  - Built with React and Tailwind CSS for a clean experience

---

## 🛠️ Tech Stack

| Layer        | Technology               |
|--------------|---------------------------|
| Frontend     | React, Tailwind CSS       |
| Backend      | Python, Django            |
| AI Model     | Google Gemini 2.0 flash (Free)  |
| Hosting      | Vercel (frontend), Render (backend) |

---

## 🎯 Use Case

This tool is ideal for:
- Developers seeking instant code review before PRs
- Students looking for feedback on assignments
- Solo coders or bootcamp learners
- Pre-interview self-review
---

## 🏗️ Architecture Overview
```
Frontend (React) ←→ Backend API (Django + DRF) ←→ Google Gemini Pro AI
```
## 🔑 Getting Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key and add it to your `.env` file
