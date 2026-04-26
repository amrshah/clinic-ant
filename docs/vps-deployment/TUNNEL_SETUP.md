# Cloudflare Tunnel Setup Guide
## Prerequisites
- Cloudflare account with access to samwebdevs.dpdns.org domain
- Docker and Docker Compose installed
## Setup Instructions
### 1. Create Cloudflare Tunnel Token
1. Go to Cloudflare Dashboard
2. Navigate to Zero Trust → Networks → Tunnels
3. Click "Create a tunnel" and select "Cloudflared" as the connector
4. Name it "ClinicFlow-Production"
5. Copy the tunnel token provided
### 2. Add Tunnel Token to Environment
Add the following to your `.env.local` file:
```
CLOUDFLARED_TOKEN=<your-tunnel-token>
```
### 3. Configure DNS in Cloudflare
1. In Cloudflare Zero Trust, go to Networks → Tunnels
2. Click on "ClinicFlow-Production" tunnel
3. Go to "Public Hostnames" tab
4. Add hostname: `ClinicFlow.samwebdevs.dpdns.org`
5. Service: `http://clinic-flow:3000` (or the custom port you're using)
### 4. Deploy
```bash
docker-compose up -d
```
The tunnel will automatically connect and route traffic from `ClinicFlow.samwebdevs.dpdns.org` to your ClinicFlow application.
## Configuration Files
- `docker-compose.yml` - Docker Compose configuration with cloudflared service
- `config/tunnel-config.yml` - Tunnel ingress rules
## Troubleshooting
If the tunnel isn't connecting:
1. Check logs: `docker logs clinic-flow-tunnel`
2. Verify tunnel token is correct
3. Ensure tunnel exists in Cloudflare dashboard
4. Check that ClinicFlow.samwebdevs.dpdns.org is properly configured in Cloudflare