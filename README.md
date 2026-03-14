# 🎓 Pro Classroom – Smart Classroom with AI Plagiarism Detection

<p align="center">
  <img src="https://img.shields.io/badge/MERN Stack-Full Stack-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/OpenAI-GPT Integration-412991?style=for-the-badge&logo=openai" />
  <img src="https://img.shields.io/badge/Recharts-Analytics-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MongoDB Atlas-Cloud DB-green?style=for-the-badge&logo=mongodb" />
</p>

> A **production-grade**, full-stack classroom management platform with an AI-powered plagiarism detection engine. Built with industry-standard patterns: MVC architecture, TF-IDF + N-Gram matching, OpenAI-powered explanations, and rich analytics dashboards.

---

## 🚀 Live Features

| Category | Feature |
|---|---|
| 🔐 Auth | Role-based JWT auth (Teacher / Student) |
| 🏫 Classes | Create classes (Teacher), join via Code (Student) |
| 📝 Assignments | Post assignments with optional file attachments |
| 📤 Submissions | Students upload PDF/TXT with duplicate prevention |
| 🧠 AI Detection | TF-IDF + N-Gram Phrase Extraction + OpenAI Explanation |
| 📊 Analytics | Recharts Pie & Bar graphs on Teacher Dashboard |
| 👤 Profile | Student submission history + similarity trend line charts |
| ⏰ Cron Jobs | Daily automated deadline reminder notifications |
| 🛡 Security | Rate limiting, file type guard, 10MB cap, JWT auth |
| 🚦 Logging | Morgan HTTP request logging |
| ☁️ Storage | Cloudinary file hosting |

---

## 🏗️ Architecture

```
pro-classroom-main/
├── client/                     # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── LandingPage.jsx        # SEO-optimized landing page
│       │   ├── Dashboard.jsx          # Main dashboard (Teacher / Student)
│       │   ├── SubmissionList.jsx     # AI report panel, phrase highlighting
│       │   ├── StudentProfile.jsx     # Profile + trend line chart
│       │   ├── TeacherClassDetail.jsx
│       │   ├── StudentSubmissionForm.jsx
│       │   └── ...
│       └── api/api.js                 # Unified fetch wrapper
│
└── server/                      # Node.js + Express (MVC)
    ├── controllers/              # Request handlers
    │   ├── user.controller.js
    │   ├── class.controller.js
    │   ├── assignment.controller.js
    │   └── submission.controller.js
    ├── services/
    │   └── aiExplanationService.js   # OpenAI GPT integration
    ├── middleware/
    │   ├── auth.js                   # JWT verification
    │   ├── roleCheck.js              # Teacher/Student guards
    │   ├── upload.js                 # Multer file validation
    │   └── errorHandler.js          # Centralized error handling
    ├── jobs/
    │   └── cronJobs.js              # Node-Cron deadline notifications
    ├── utils/
    │   └── textProcessor.js         # TF-IDF + N-Gram engine
    ├── models/
    │   ├── User.js
    │   ├── Class.js
    │   ├── Assignment.js
    │   └── Submission.js
    └── index.js                     # Entry point (Morgan, Rate Limiting, Routes)
```

---

## 🧠 Plagiarism Engine

The plagiarism detection system is a custom-built multi-layer engine:

1. **Text Extraction** — Extracts text from PDF/TXT via `pdf-parse`
2. **TF-IDF Cosine Similarity** — Ranks documents by weighted term importance
3. **N-Gram Phrase Matching** — Identifies exact 5-word phrase overlaps between submissions
4. **OpenAI Explanation** — Generates a natural-language report via GPT-3.5-Turbo:
   > *"Student A and Student B share multiple identical phrases related to the core algorithms section, with structure indicating direct copying..."*

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js >= 18
- MongoDB Atlas URI
- Cloudinary Account
- OpenAI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/vishalrajputhere/pro-classroom.git
cd pro-classroom-main

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Variables

Create a `server/.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_key
```

### Running Locally

```bash
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
cd client
npm run dev
```

Frontend: [http://localhost:5173](http://localhost:5173)  
Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🔐 API Overview

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/users/register` | Public | Register a new user |
| POST | `/api/users/login` | Public | Login and get JWT |
| GET | `/api/users/me` | Private | Get current user |
| GET | `/api/classes/teacher` | Teacher | Get teacher's classes |
| POST | `/api/classes/create` | Teacher | Create a new class |
| GET | `/api/classes/student` | Student | Get enrolled classes |
| POST | `/api/classes/join` | Student | Join class by code |
| POST | `/api/assignments/post` | Teacher | Create assignment |
| POST | `/api/assignments/submit` | Student | Submit assignment (AI scan) |
| GET | `/api/submissions/me` | Student | Get own submission history |
| GET | `/api/submissions/assignment/:id` | Teacher | View all submissions |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion |
| Backend | Node.js, Express, Mongoose, Multer |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| AI/NLP | OpenAI GPT-3.5-Turbo, custom TF-IDF + N-Gram engine |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Jobs | node-cron |
| Security | express-rate-limit, Morgan, Multer file guards |

---

## 👨‍💻 Author

**Vishal Singh Rajput**  
[GitHub](https://github.com/vishalrajputhere) • [LinkedIn](https://linkedin.com/in/vishalrajputhere)

> Built with ❤️ as a production-grade portfolio project demonstrating full-stack engineering, AI integration, and enterprise-level software patterns.
