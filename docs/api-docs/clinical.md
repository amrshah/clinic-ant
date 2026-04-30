# Clinical: Appointments & Medical Records

## Appointments
Scheduling and visit management.

### `GET /appointments`
List all appointments.
- **Parameters**: `clinicId`, `date` (optional)

### `POST /appointments`
Book a new appointment.
- **Body**: `pet_id`, `owner_id`, `date`, `time`, `reason`, `type`, `clinic_id`.

### `PATCH /appointments/{id}`
Update appointment status (e.g., `checked-in`, `completed`).

---

## Medical Records
Clinical history and visit notes.

### `GET /medical-records`
Fetch medical records.
- **Parameters**: `petId` (Required) - Fetches full history for a specific pet.

### `POST /medical-records`
Add a new clinical entry.
- **Body**: `pet_id`, `appointment_id`, `type`, `subjective`, `objective`, `assessment`, `plan`.

### `GET /medical-records/{id}`
Fetch a specific record entry.
