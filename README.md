# WorkHub - Monorepo Structure

WorkHub is a Jira-style work management SaaS designed for MSMEs, featuring a Spring Boot backend and a React (Vite) + TypeScript frontend.

## Project Structure

This repository is organized as a **Monorepo**:

- `/backend`: Contains the Spring Boot 3 Java application (Maven).
- `/frontend`: Contains the React + TypeScript application (Vite).

*Note: To run either application locally, ensure your terminal is navigated into the respective subdirectory (`cd backend` or `cd frontend`).*

## CI/CD Pipeline Architecture

We utilize an automated Continuous Integration and Continuous Deployment (CI/CD) pipeline directly tied to the `main` branch.

### Frontend Deployment (Vercel)
The frontend is built and deployed automatically via **GitHub Actions**. 
On every push or pull request to `main`:
1. The `.github/workflows/ci.yml` pipeline triggers.
2. It runs `mvn test` in the `/backend` and `npm run build` in the `/frontend` in parallel.
3. Upon success of both jobs, a third job (`frontend-deploy`) triggers a Vercel deployment using the `amondnet/vercel-action` utilizing standard GitHub secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`).

### Backend Deployment (Railway)
The backend is seamlessly auto-deployed via **Railway's native Git Integration**.
- **No GitHub Action Required:** Railway is connected directly to this repository. 
- On every push to `main`, Railway detects changes in the `/backend` directory (configured via Railway's Root Directory setting).
- It automatically provisions the environment (Java 17), runs the Maven build (`mvn clean package`), provisions the PostgreSQL database, and deploys the application container.
- Flyway migrations run automatically on boot to ensure the database schema is perfectly synced with the code.

---

### Local Development Quick Start

**Backend:**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```
Runs on `http://localhost:8080`.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`.
