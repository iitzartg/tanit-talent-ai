# Tanit-Talent (MERN Recruitment Platform)

This project is a full-stack MERN recruitment platform with authentication, role-based access control, user management, job posting, and candidate applications.

It includes:
- A Node.js + Express + MongoDB backend API.
- A React + Vite frontend.
- Clerk-to-backend auth sync with JWT session handling.
- Recruiter job posting and candidate application flows persisted in MongoDB.
- Protected admin routes for full user CRUD operations.

## Features

- Full User CRUD (`create`, `read all`, `read one`, `update`, `delete`).
- Recruiter can create and manage jobs from dashboard.
- Candidate can browse jobs and apply from dashboard.
- Applications are saved in MongoDB and visible to recruiter.
- CV Analyzer UI and messages are fully in English.
- MongoDB persistence through Mongoose models.
- Validation with `express-validator` and Mongoose schema rules.
- Centralized API error handling with consistent JSON responses.
- Role-based access control (`candidat`, `recruteur`, `admin`).
- Frontend admin user manager pages:
  - User list
  - Create user
  - View user
  - Edit user
- Loading states and toast-based error/success feedback.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + Clerk sync endpoint

## Project Structure

Current folders are `frontend` and `backend` (equivalent to `client` and `server`):

```txt
01-IMSET S2 Project/
  backend/
    src/
      config/
      controllers/
      middlewares/
      models/
      routes/
      utils/
    .env.example
  frontend/
    src/
      components/
      hooks/
      lib/
      pages/
    .env.example
  README.md
```

## Installation

### 1) Clone and install dependencies

```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

## Docker Quickstart (Recommended)

Run the full stack on any system with Docker Desktop / Docker Engine:

### 1) Prepare Docker environment variables

Copy `.env.docker.example` to `.env` at the project root and set real keys:

```bash
cp .env.docker.example .env
```

Required values:
- `CLERK_SECRET_KEY` must be a valid `sk_...` key.
- `VITE_CLERK_PUBLISHABLE_KEY` must be the matching `pk_...` key.

### 2) Build and start all services

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5001`
- MongoDB: `mongodb://localhost:27017`

### 3) Stop services

```bash
docker compose down
```

To also remove MongoDB persisted data volume:

```bash
docker compose down -v
```

### 2) Configure environment variables

#### Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and update values:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/espace_utilisateur
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=7d
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
```

#### Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 3) Run the app

Use two terminals:

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Frontend default: `http://localhost:8080` (or Vite-assigned port)  
Backend default: `http://localhost:5001`

## Docker Files

- `docker-compose.yml` - orchestrates `mongo`, `backend`, and `frontend`.
- `backend/Dockerfile` - production backend container (`npm start`).
- `frontend/Dockerfile` - Vite build + Nginx static hosting.
- `frontend/nginx.conf` - SPA route fallback (`/index.html`).
- `.dockerignore` - excludes heavy/local-only files from Docker build context.

## Frontend <-> Backend Communication

- The frontend uses `fetch` in `frontend/src/lib/api.ts`.
- Base URL is read from `VITE_API_URL`.
- Authenticated requests send `Authorization: Bearer <token>`.
- API routes are prefixed with `/api`.

## API Documentation

Base URL: `http://localhost:5001`

### Health

- `GET /api/health`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/clerk-sync`

### User CRUD

- `GET /api/users` (admin)
- `POST /api/users` (admin)
- `GET /api/users/:id` (admin)
- `PUT /api/users/:id` (admin)
- `DELETE /api/users/:id` (admin)
- `GET /api/users/me` (authenticated)
- `PUT /api/users/me` (authenticated)

### Jobs

- `GET /api/jobs` (public; active jobs)
- `GET /api/jobs/mine` (recruiter/admin)
- `POST /api/jobs` (recruiter/admin)

### Applications

- `POST /api/applications` (candidate applies to a job)
- `GET /api/applications/me` (candidate)
- `GET /api/applications/recruiter` (recruiter/admin)

### Example: Create Job

`POST /api/jobs`

```json
{
  "title": "Senior React Developer",
  "company": "Tanit-Talent",
  "location": "Tunis, Tunisia",
  "type": "Full-time",
  "salary": "3000-5000 TND",
  "description": "We are looking for a React developer with strong TypeScript skills and API integration experience.",
  "requirements": ["React", "TypeScript", "REST API"]
}
```

### Example: Apply To Job

`POST /api/applications`

```json
{
  "jobId": "6610f8d0b5c3c2b8f2a1d001"
}
```

### Example: Create User

`POST /api/users`

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "recruteur",
  "bio": "Recruiter with 5 years of experience",
  "skills": ["screening", "interviewing"],
  "cvPath": "/files/jane-cv.pdf"
}
```

Success response (`201`):

```json
{
  "message": "User created successfully.",
  "user": {
    "id": "6610...",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "recruteur",
    "createdAt": "2026-04-14T10:00:00.000Z"
  },
  "profile": null
}
```

### Common HTTP Status Codes

- `200` OK
- `201` Created
- `400` Validation error
- `401` Unauthorized
- `403` Forbidden
- `404` Not found
- `409` Conflict (duplicate email)
- `500` Internal server error

## NPM Scripts

### Backend

- `npm run dev` - start with nodemon
- `npm run start` - start with node

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - run ESLint
- `npm run test` - run tests

## Troubleshooting

- **MongoDB connection fails:** verify `MONGO_URI`, ensure MongoDB service is running.
- **401 unauthorized:** confirm JWT token exists and is sent in `Authorization` header.
- **Clerk sync fails with `secret-key-invalid`:** backend `CLERK_SECRET_KEY` must be an `sk_...` secret key (not `pk_...`).
- **CORS issues:** check frontend URL and backend CORS config.
- **Validation errors (`400`):** ensure required fields and proper formats are sent.
- **Job publish fails (`400 Validation failed`):** verify recruiter payload rules:
  - `title` min 3 chars
  - `company` min 2 chars
  - `location` min 2 chars
  - `salary` required
  - `description` min 20 chars
- **Docker frontend cannot reach backend:** ensure `VITE_API_URL` in root `.env` points to `http://localhost:5001` for browser access.
- **Docker backend cannot start:** verify root `.env` has valid `JWT_SECRET` and `CLERK_SECRET_KEY`.
- **Frontend cannot reach backend:** verify `VITE_API_URL` and backend port.

## Notes and Assumptions

- The project already used `frontend` / `backend` naming; these are kept as the client/server split.
- Existing auth and role architecture was preserved and extended.
- Admin-only access is enforced for full user CRUD routes.
- Clerk self-service role selection is limited to `candidat` and `recruteur`; admin users should be created by an existing admin through CRUD or seeded directly in the database.
- Recruiter dashboard includes an `Open Jobs List` button that routes to `/jobs`.
