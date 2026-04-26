# ClinicFlow VPS Deployment Guide

This guide describes how to deploy the ClinicFlow stack (Marketing + App) to a VPS using Docker Compose and Cloudflare Tunnels.

## Prerequisites

1.  **VPS** with Ubuntu/Debian (recommended).
2.  **Docker & Docker Compose** installed.
3.  **Portainer** (optional but recommended for management).
4.  **Cloudflare Account** with the `clinicflow.vet` domain.

## 1. Cloudflare Setup

### Create a Tunnel
1.  Go to **Cloudflare Zero Trust → Networks → Tunnels**.
2.  Click **Create a tunnel**, select **Cloudflared**.
3.  Name it `ClinicFlow-Production`.
4.  Copy the **Tunnel Token**.

### Configure Public Hostnames
In the tunnel settings, add two hostnames:
1.  **`clinicflow.vet`** → Service: `http://gateway:80`
2.  **`demo.clinicflow.vet`** → Service: `http://gateway:80`

## 2. Server Configuration

### Environment Variables
Create a `.env` file in your stack directory:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDFLARED_TOKEN=your_cloudflare_tunnel_token
```

### Directory Structure
```text
clinicflow/
├── .env
├── docker-compose.yml
├── config/
│   └── nginx.conf
└── [Application Source Files]
```

## 3. Deployment

Run the following command in the `clinicflow` directory:
```bash
docker-compose up -d --build
```

## 4. Verification

1.  Check container logs: `docker-compose logs -f gateway`
2.  Check tunnel status: `docker-compose logs -f cloudflared`
3.  Visit `clinicflow.vet` to see the marketing site.
4.  Visit `demo.clinicflow.vet` to see the app login.

## Troubleshooting

- **Login Failed**: Ensure `.env` is correctly loaded in `docker-compose.yml` (`env_file: - .env`).
- **404 Assets**: Check `marketing/index.html` script tags; ensure they are `<script type="module" src="/main.js"></script>`.
- **Tunnel Offline**: Verify the token in `.env` matches the one in Cloudflare.
