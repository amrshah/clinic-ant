# API Overview

ClinicFlow exposes a RESTful API for managing veterinary clinics, patients, and operations.

## Base URL
All API requests should be made to:
`http://localhost:3000/api` (Development)
`https://app.clinicflow.demo/api` (Production)

## Authentication
Authentication is handled via Supabase Auth. For API requests:
- **Client-side**: Handled automatically via cookies/session.
- **Service-to-Service**: Use the `Authorization: Bearer <token>` header.

## Common Query Parameters
| Parameter | Type | Description |
|---|---|---|
| `clinicId` | UUID | Restricts the request context to a specific clinic location. |

## Error Responses
The API uses standard HTTP status codes:
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions (RBAC)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side exception

Example error body:
```json
{
  "error": "Access denied. Your role (reception) does not allow this action."
}
```
