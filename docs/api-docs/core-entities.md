# Core Entities: Pets & Owners

## Owners
Management of pet owners and their contact information. PII data is encrypted at rest.

### `GET /owners`
List all owners in the current organization/clinic.
- **Parameters**: `clinicId` (optional)
- **Response**: Array of `Owner` objects.

### `POST /owners`
Create a new owner.
- **Body**: `first_name`, `last_name`, `email`, `phone`, `address`, `city`.

### `GET /owners/{id}`
Fetch a single owner.

### `PATCH /owners/{id}`
Update owner details.

---

## Pets
Management of animal patients.

### `GET /pets`
List all pets.
- **Parameters**: `clinicId` (optional)

### `POST /pets`
Register a new pet.
- **Body**: `name`, `species`, `breed`, `date_of_birth`, `gender`, `owner_id`.

### `GET /pets/{id}`
Fetch detailed pet information.
