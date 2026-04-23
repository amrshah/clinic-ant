# Deployment Plan: Docker & Coolify

This plan outlines the steps to deploy ClinicFlow using Docker Desktop locally and via Coolify on WSL.

## Prerequisites

- **Docker Desktop**: Installed and running on Windows.
- **WSL2**: Required for Coolify and Docker Desktop backend.
- **Supabase Cloud**: Active project with URL and API keys.

## Configuration Files

The following files have been created in the project root:
1. **[Dockerfile](file:///d:/MyApps/clinic-flow/Dockerfile)**: Multi-stage production build.
2. **[docker-compose.yml](file:///d:/MyApps/clinic-flow/docker-compose.yml)**: Orchestration for local/Coolify deployment.
3. **[.dockerignore](file:///d:/MyApps/clinic-flow/.dockerignore)**: Build optimization.

## Local Deployment (Docker Desktop)

1. **Environment Setup**:
   Ensure your `.env.local` file contains the required Supabase variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Run with Compose**:
   Open a terminal in the project root and run:
   ```powershell
   docker compose up -d --build
   ```

3. **Access**:
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Coolify Deployment (WSL)

Since Coolify is running on your WSL instance:

1. **New Project**: Create a new Project in the Coolify dashboard.
2. **New Resource**: Choose "Docker Compose".
3. **Source**: You can either point it to your Git repository or paste the contents of `docker-compose.yml`.
4. **Environment Variables**:
   In the "Variables" tab of your resource, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deployment**: Click "Deploy". Coolify will build the image using the provided `Dockerfile` and manage the container.

---

## Future: Dockerized Supabase
To switch to a local Supabase instance later:
1. Use the [Supabase CLI](https://supabase.com/docs/guides/resources/supabase-cli) to initialize a local project: `npx supabase init`.
2. Update the `docker-compose.yml` to include the Supabase services.
3. Update the `NEXT_PUBLIC_SUPABASE_URL` in your app container to point to the local Supabase container.

