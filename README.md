# Waygood Study Abroad Platform — Backend Assignment

A study-abroad platform backend built with Node.js, Express.js, MongoDB, and Mongoose. It supports student authentication, university and program discovery, personalized program recommendations, application tracking, and dashboard summaries.

## 1. Project Overview

This project extends the Waygood candidate evaluation starter into a study-abroad API for students and counselors.

### Key Features

- **Authentication:** Student registration, login, JWT authentication, and a protected profile endpoint.
- **University Discovery:** Search, filtering, pagination, sorting, and popular-university results.
- **Program Discovery:** Filtering by destination, degree level, field, intake, tuition budget, and scholarship availability.
- **Recommendation Engine:** MongoDB aggregation-based program matching using student preferences.
- **Application Workflow:** Application creation, duplicate prevention, status transitions, and timeline history.
- **Dashboard:** Summary counts, application status breakdown, and popular destination statistics.
- **Performance:** API caching and MongoDB indexes.
- **Testing:** Automated API tests using Jest and Supertest.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | Database models and queries |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| Jest | Automated testing |
| Supertest | HTTP API testing |
| Morgan | HTTP request logging |
| Nodemon | Development server |

## 3. Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── app.test.js
│   │   └── testSetup.js
│   ├── .env.example
│   └── package.json
├── frontend/
├── docs/
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 4. Prerequisites

Install the following before running the application:

- Node.js and npm
- MongoDB running locally or a MongoDB connection string
- Git

## 5. Installation and Setup

### Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

### Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file by copying `.env.example`.

On Windows Command Prompt:

```bat
copy .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Configure the environment variables in `backend/.env`.

Example:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/waygood
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1d
CACHE_TTL_SECONDS=300
```

Use your actual MongoDB database name if it differs from `waygood`. Never commit `.env` or production secrets to GitHub.

### Seed the database

```bash
npm run seed
```

The seed script creates sample students, universities, programs, and applications.

### Start the backend

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API uses port `4000` by default. If you configure another port, update the base URL accordingly.

### Start the frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Follow the development URL printed by the frontend command.

## 6. API Reference

Base URL:

```text
http://localhost:4000
```

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check API health |

### Authentication

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a student |
| POST | `/api/auth/login` | Public | Authenticate a user |
| GET | `/api/auth/me` | Bearer token | Retrieve the authenticated user's profile |

Registration accepts a full name, email, and password of at least eight characters. Email addresses are normalized to lowercase. Passwords are hashed before storage.

Example registration request:

```json
{
  "fullName": "Demo Student",
  "email": "demo@example.com",
  "password": "StrongPassword123!"
}
```

Example login request:

```json
{
  "email": "demo@example.com",
  "password": "StrongPassword123!"
}
```

For protected endpoints, include the JWT returned by login:

```text
Authorization: Bearer <JWT_TOKEN>
```

### Universities

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/universities` | List and filter universities |
| GET | `/api/universities/popular` | Retrieve popular universities |

The discovery API supports pagination, sorting, search, and supported filters such as country and scholarship availability.

Example:

```text
GET /api/universities?page=1&limit=5
GET /api/universities?country=Canada&scholarshipAvailable=true
GET /api/universities?q=Canada&sortBy=name
```

### Programs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/programs` | List and filter programs |

Supported filters include country, degree level, field, intake, tuition budget, scholarship availability, and search terms. Pagination and sorting options are validated.

Examples:

```text
GET /api/programs?page=1&limit=5
GET /api/programs?maxTuition=20000&scholarshipAvailable=true&sortBy=tuitionAsc
```

Invalid pagination values or non-numeric tuition limits return a validation error.

### Recommendations

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/recommendations/:studentId` | Verify configured route middleware | Recommend matching programs |

The recommendation service uses MongoDB aggregation to evaluate program matches using student preferences, including destination countries, budget, field of interest, intake, and IELTS requirements.

Example:

```text
GET /api/recommendations/<STUDENT_ID>
```

The response includes matching programs, scores, and match explanations.

### Applications

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/applications` | Required | List permitted applications |
| POST | `/api/applications` | Required | Submit an application |
| PATCH | `/api/applications/:id/status` | Required | Update application status with role checks |

Example application request:

```json
{
  "programId": "<PROGRAM_ID>",
  "intake": "September"
}
```

The authenticated student's ID is taken from the JWT-backed user context rather than trusting a student ID supplied in the request body.

The API prevents duplicate applications for the same student, program, and intake. Invalid status transitions are rejected, and valid status changes are recorded in the application timeline.

### Dashboard

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/dashboard/overview` | Verify configured route middleware | Retrieve dashboard statistics |

The overview response includes total students, total programs, total applications, application status breakdown, and top destination countries.

## 7. Application Workflow

The application model supports these statuses:

```text
draft
  └── submitted
        └── under-review
              ├── offer-received
              │     └── visa-processing
              │            └── enrolled
              └── rejected
```

The configured transition rules determine which status changes are valid. Rejected applications are terminal in the current transition configuration.

Each valid status update adds a timestamped history entry. Duplicate applications are also protected by a unique compound index on student, program, and intake.

## 8. Security and Validation

- JWT-based authentication for protected endpoints.
- Password hashing using bcryptjs.
- Role-based restrictions on application operations.
- Validation of request parameters and identifiers.
- Consistent HTTP error responses through error-handling middleware.
- Duplicate-application prevention.
- CORS configuration and request logging.
- Environment variables for database connection and JWT configuration.

Use a strong JWT secret outside development. Public registration should not allow users to assign themselves the counselor role.

## 9. Caching and Database Performance

The backend includes caching for supported frequently accessed API responses. For example, a dashboard response may return cache metadata such as `hit` or `miss`.

### Indexing strategy

The application schema defines indexes on important query fields, including student, program, destination country, intake, and application status.

A compound unique index on:

```text
student + program + intake
```

prevents duplicate applications for the same student, program, and intake.

Indexes improve frequently used lookups and enforce uniqueness, but they add storage and write overhead. Index choices should be evaluated against real query patterns and execution statistics.

### Performance considerations

- Use pagination to limit the number of returned records.
- Select only required fields when possible.
- Populate related documents only when needed.
- Use aggregation pipelines for recommendation scoring.
- Cache suitable read-heavy endpoints.
- Keep cache invalidation and TTL behavior in mind when underlying data changes.

## 10. Automated Testing

The backend uses Jest and Supertest.

Install test dependencies:

```bash
cd backend
npm install
```

Run the test suite:

```bash
npm test
```

The current test suite covers:

- Health endpoint success.
- Protected profile access without a token.
- Login with invalid credentials.
- Application listing without a token.
- Application creation without a token.

These tests exercise important API behavior and include unauthorized-access edge cases.

The test setup uses a separate MongoDB database configuration (`TEST_MONGODB_URI`) to avoid running tests against the normal development database. Ensure the test database is available before adding tests that require database records.

## 11. Seeded Sample Credentials

The starter seed data documents these sample accounts:

- `aarav@example.com`
- `sara@example.com`
- `counselor@example.com`

The starter README lists `Candidate123!` as the sample password. Use these credentials only in a local seeded environment, and verify the seed script's behavior before relying on them.

Do not publish real credentials, tokens, or secrets in the repository.

## 12. Assumptions and Design Decisions

- Student registration creates a student account by default.
- Authenticated identity is derived from the JWT, not a client-supplied student ID.
- Students may submit applications for supported program intakes.
- Application status changes must follow the configured transition map.
- The database enforces application uniqueness in addition to controller validation.
- Recommendation scores are rule-based matches derived from student preferences.
- The seeded catalog is demonstration data and should not be treated as authoritative university information.
- The React dashboard and optional bonus features may require additional integration work.

## 13. Future Improvements

Potential improvements include:

- More comprehensive integration tests with isolated fixtures.
- Automated tests for registration, successful login, recommendations, duplicate applications, and status transitions.
- Request rate limiting and stronger production security configuration.
- Cache invalidation tests and query-plan analysis.
- Docker Compose for repeatable local setup.
- Improved dashboard integration and deployment documentation.

## 14. Submission

Before submitting:

1. Confirm the backend starts successfully.
2. Run the seed command on a local development database.
3. Run `npm test` and record the results.
4. Verify that `.env`, secrets, and unnecessary generated files are excluded from Git.
5. Push the completed project to your GitHub repository.
6. Share the repository URL and setup instructions with the evaluator.

---

**Project:** Waygood Study Abroad Candidate Evaluation  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Testing:** Jest, Supertest
