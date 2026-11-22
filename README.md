# Smart Spam Detection System (MERN)

A full-stack email spam checker built with MongoDB, Express, React, and Node.js.
It classifies pasted email text using a transparent rule-based scoring engine, saves checks to MongoDB, and provides login/register plus a personal history dashboard.

> This is a practical starter project, not a production-grade email gateway. The classifier uses explainable heuristics rather than a trained ML model, so it can make mistakes. Do not paste confidential email content into a publicly deployed instance.

## Features
- Register and log in with JWT authentication
- Paste an email subject and body for analysis
- Spam score from 0–100, label (Spam / Suspicious / Likely Safe), and matched signals
- Save analysis history per user
- Dashboard summary and delete individual history records
- Responsive React UI
- MongoDB Atlas or local MongoDB support

## Requirements
- Node.js 20+ and npm
- MongoDB local installation or a MongoDB Atlas database

## 1. Configure backend
```bash
cd backend
copy .env.example .env
```
On macOS/Linux, use `cp .env.example .env`.

Edit `backend/.env`:
- `MONGODB_URI`: local MongoDB URI or Atlas connection string
- `JWT_SECRET`: long random secret (at least 32 characters recommended)
- `CLIENT_ORIGIN`: frontend URL, locally `http://localhost:5173`
- `PORT`: `5000`

## 2. Install and run backend
```bash
cd backend
npm install
npm run dev
```
API health check: `http://localhost:5000/api/health`

## 3. Install and run frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

Vite proxies `/api` calls to `http://localhost:5000` during development.

## 4. Use the app
1. Register with your name, email, and password.
2. Log in.
3. Enter the email subject and body.
4. Click **Analyze email**.
5. Review the classification, score, and matched signals.
6. Open **History** to review or delete previous checks.

## API routes
| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Log in |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/analysis` | Yes | Analyze and save email |
| GET | `/api/analysis` | Yes | Current user's history |
| GET | `/api/analysis/stats` | Yes | Dashboard statistics |
| DELETE | `/api/analysis/:id` | Yes | Delete own history item |

## Deploying
### MongoDB Atlas
1. Create a cluster at https://www.mongodb.com/atlas.
2. Create a database user and allow your deployment provider's IP access (for a learning deployment, Atlas network access can be configured as appropriate; avoid unrestricted access when possible).
3. Copy the application connection string into the backend `MONGODB_URI`.

### Backend on Render
1. Create a **Web Service** from this project repository.
2. Set **Root Directory** to `backend`.
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN` (your deployed frontend URL), and optionally `PORT` if required by the host.

### Frontend on Vercel
1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add `VITE_API_URL` with your deployed backend base URL, e.g. `https://your-api.onrender.com/api`.
6. Redeploy after changing environment variables.

For production, configure CORS to allow only the deployed frontend origin. Never commit `.env` files or real secrets.

## Important security and accuracy notes
- Passwords are hashed with bcrypt.
- API routes use JWT authentication and only expose a user's own analysis history.
- Rate limiting and input length limits are enabled.
- The classifier is a heuristic demo; verify suspicious emails manually and do not treat its score as a guarantee.
- For real mailboxes, integrate with a properly authorized mail provider API and request user consent; this app intentionally analyzes text that a user pastes into it.
