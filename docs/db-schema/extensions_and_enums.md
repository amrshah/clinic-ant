# Extensions and Enums

This document lists all PostgreSQL extensions and custom types (Enums) used in the ClinicFlow database.

## Extensions

| Extension Name | Purpose |
|---|---|
| `pgcrypto` | Used for encryption and decryption of sensitive PII data (e.g., owner names). |

## Custom Types (Enums)

### `user_role`
Defines the hierarchical roles for clinic staff.
- `administrator`
- `veterinarian`
- `nurse_assistant`
- `reception`
- `technician`
- `client`

### `consent_type`
Types of PIPEDA-compliant data consent.
- `data_collection`
- `data_sharing`
- `marketing`
- `emergency_contact`

### `consent_status`
- `granted`
- `revoked`
- `pending`

### `data_request_type`
Types of data access requests.
- `access`
- `deletion`
- `correction`
- `portability`

### `data_request_status`
- `pending`
- `in_progress`
- `completed`
- `denied`
