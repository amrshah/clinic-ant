# Operational & System

## Clinics
Multi-branch management.

### `GET /api/clinics`
List all clinics in the organization.

---

## Dashboard
Aggregated metrics and recent activity.

### `GET /api/dashboard`
Returns statistics and lists for the dashboard view.
- **Parameters**: `clinicId` (required)

---

## Users & Profiles
Staff and access management.

### `GET /api/profile`
Fetch the currently logged-in user's profile and permissions.

### `GET /api/users`
List all staff members (Admin only).

### `POST /api/users`
Invite/Create a new staff member.

---

## AI Clinical Assistant (Chat)
AI-powered assistance for staff.

### `POST /api/chat`
Submit a message to the AI assistant.
- **Body**: `messages` (array of message objects).
- **Functionality**: Uses Gemini 1.5 Pro to answer clinical or operational questions based on the current context.

---

## Audit Logs
Security and activity tracking.

### `GET /api/audit-logs`
Fetch activity logs (Admin only).
