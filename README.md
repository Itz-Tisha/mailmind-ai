# SmartInbox — AI Email Copilot
An AI-powered Gmail assistant that helps you read, summarize, categorize, and draft emails using [Groq](https://groq.com/) LLMs. Sign in with Google, manage your inbox from a modern React UI, and let the copilot handle summaries, replies, calendar extraction, and daily insights.
## Features
- **Google OAuth** — Secure login/signup with Gmail and Google Calendar access
- **Inbox view** — Fetch and browse emails from your Gmail account
- **AI summarization & categorization** — Groq-powered summaries and labels (Work, Finance, Education, etc.)
- **Smart compose** — Generate full email drafts from a short description
- **Thread replies** — AI-generated replies based on email thread context
- **Bulk draft generation** — Auto-generate draft responses for multiple emails
- **Calendar integration** — Extract events from emails and add them to Google Calendar
- **Mood insights** — Daily email mood analysis with a pie chart on your profile
- **Daily report cron** — Scheduled PDF summary of your inbox, emailed to you
- **Encrypted tokens** — Google OAuth tokens stored encrypted in MongoDB
## Tech Stack
| Layer    | Technologies |
|----------|--------------|
| Frontend | React 18, Vite, React Router, Chart.js, Axios |
| Backend  | Node.js, Express 5, MongoDB (Mongoose) |
| AI       | Groq SDK |
| APIs     | Gmail API, Google Calendar API, Google OAuth 2.0 |
## Project Structure
```
final_groq_person_email_copilot/
├── backend/
│   ├── app.js                 # Express server entry point
│   ├── cron/
│   │   └── dailySummary.js    # Scheduled daily inbox PDF report
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── models/                # Mongoose schemas (User, MailHistory, etc.)
│   ├── routes/                # API routes (auth, gmail, compose, ai, calendar)
│   ├── services/              # Gmail send, Google auth, LLM helpers
│   └── utils/                 # Token encryption, LLM utilities
└── frontend/
    └── copilot/
        └── src/
            ├── components/    # Login, Home, Compose, Profile
            └── contexts/      # Theme context (light/dark mode)
```
## Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) database (local or Atlas)
- [Google Cloud Console](https://console.cloud.google.com/) project with:
  - OAuth 2.0 credentials (Web application)
  - Gmail API and Google Calendar API enabled
- [Groq API key](https://console.groq.com/)
## Environment Variables
### Backend (`backend/.env`)
Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smartinbox
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=llama-3.3-70b-versatile
# 64-character hex string for encrypting OAuth tokens at rest
OAUTH_TOKEN_KEY=your_64_char_hex_key
```
### Frontend (`frontend/copilot/.env`)
Create a `.env` file in the `frontend/copilot` folder:
```env
VITE_BACKEND_URL=http://localhost:5000
```
### Google OAuth Setup
1. In Google Cloud Console, create OAuth 2.0 credentials (Web application).
2. Add authorized redirect URI: `http://localhost:5000/auth/callback` (or your deployed backend URL).
3. Enable **Gmail API** and **Google Calendar API** for your project.
4. Copy the Client ID and Client Secret into your backend `.env`.
## Installation
### 1. Clone the repository
```bash
git clone <repository-url>
cd final_groq_person_email_copilot
```
### 2. Install backend dependencies
```bash
cd backend
npm install
```
### 3. Install frontend dependencies
```bash
cd ../frontend/copilot
npm install
```
## Running Locally
### Start the backend
```bash
cd backend
npm run dev
```
The API server runs on the port defined in `PORT` (default `5000`).
### Start the frontend
In a separate terminal:
```bash
cd frontend/copilot
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.
## API Routes Overview
| Route prefix      | Description |
|-------------------|-------------|
| `/auth`           | Google OAuth login, signup, callback |
| `/user`           | User profile (`/me`) |
| `/gmail`          | Fetch emails, generate drafts |
| `/api/compose`    | AI compose and save drafts |
| `/thread`         | Thread reply generation and draft saving |
| `/ai-extra`       | Summarize and categorize emails |
| `/ai-mood`        | Daily mood analysis from emails |
| `/calendar`       | Add calendar events from emails |
## Scripts
### Backend
| Command       | Description |
|---------------|-------------|
| `npm run dev` | Start server with nodemon |
| `npm start`   | Start server (production) |
### Frontend
| Command         | Description |
|-----------------|-------------|
| `npm run dev`   | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
