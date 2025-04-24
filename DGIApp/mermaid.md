# DGI Application Diagrams

## Use Case Diagram

```mermaid
graph TD
    subgraph DGI System
        A[User] --> B[Authentication]
        A --> C[Request Management]
        A --> D[Attestation Management]
        A --> E[Profile Management]
        A --> F[User Management]
        
        B --> B1[Login]
        B --> B2[Register]
        
        C --> C1[Create Request]
        C --> C2[View Request List]
        C --> C3[View Request Details]
        C --> C4[Edit Request]
        C --> C5[Track Request]
        
        D --> D1[Create Attestation]
        D --> D2[View Attestation List]
        D --> D3[View Attestation Details]
        
        E --> E1[View Profile]
        E --> E2[Update Profile]
        
        F --> F1[Manage Users]
        F --> F2[View User List]
        F --> F3[Edit User Details]
    end
```

## Sequence Diagrams

### Authentication Sequence
```mermaid
sequenceDiagram
    title Authentication Sequence
    actor User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Access Login Page
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Validate Credentials
    Database-->>Backend: User Data
    Backend-->>Frontend: JWT Token + User Info
    Frontend-->>User: Redirect to Dashboard
```

### Request Creation Sequence
```mermaid
sequenceDiagram
    title Request Creation Sequence
    actor User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Fill Request Form
    Frontend->>Backend: POST /api/requests
    Backend->>Database: Save Request
    Database-->>Backend: Request ID
    Backend-->>Frontend: Success Response
    Frontend-->>User: Show Success Message
```

### Attestation Creation Sequence
```mermaid
sequenceDiagram
    title Attestation Creation Sequence
    actor User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Fill Attestation Form
    Frontend->>Backend: POST /api/attestations
    Backend->>Database: Save Attestation
    Database-->>Backend: Attestation ID
    Backend-->>Frontend: Success Response
    Frontend-->>User: Show Success Message
```

### Request Tracking Sequence
```mermaid
sequenceDiagram
    title Request Tracking Sequence
    actor User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enter Request ID
    Frontend->>Backend: GET /api/requests/{id}
    Backend->>Database: Fetch Request Status
    Database-->>Backend: Request Details
    Backend-->>Frontend: Request Status
    Frontend-->>User: Display Status
```

### User Management Sequence
```mermaid
sequenceDiagram
    title User Management Sequence
    actor Admin
    participant Frontend
    participant Backend
    participant Database

    Admin->>Frontend: Access User Management
    Frontend->>Backend: GET /api/users
    Backend->>Database: Fetch Users
    Database-->>Backend: User List
    Backend-->>Frontend: User Data
    Frontend-->>Admin: Display User List
    
    Admin->>Frontend: Edit User
    Frontend->>Backend: PUT /api/users/{id}
    Backend->>Database: Update User
    Database-->>Backend: Updated User
    Backend-->>Frontend: Success Response
    Frontend-->>Admin: Show Success Message
```

## Class Diagram

```mermaid
classDiagram
    class User {
        -Long id
        -String username
        -String email
        -String password
        -ERole role
        +getAuthorities()
    }

    class ERole {
        <<enumeration>>
        ROLE_FRONTDESK
        ROLE_PROCESSING
        ROLE_MANAGER
        ROLE_ADMIN
    }

    class Request {
        -Long id
        -LocalDate dateEntree
        -String raisonSocialeNomsPrenom
        -String cin
        -String pmPp
        -String objet
        -LocalDate dateTraitement
        -String etat
        -String ifValue
        -String ice
        -String secteur
        -String motifRejet
        -String tp
        -String email
        -String gsm
        -String fix
        -String remarque
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        -User agent
        -User creator
    }

    class Attestation {
        -Long id
        -String ifValue
        -String cin
        -String nom
        -String prenom
        -String email
        -String phone
        -String type
        -String status
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        -User creator
    }

    class AuthController {
        +signup()
        +login()
        +changePassword()
    }

    class UserController {
        +getAllUsers()
        +getUserById()
        +updateUser()
        +deleteUser()
    }

    class RequestController {
        +createRequest()
        +getRequest()
        +updateRequest()
        +getAllRequests()
        +exportToExcel()
    }

    class AttestationController {
        +createAttestation()
        +getAttestation()
        +getAllAttestations()
        +exportToExcel()
    }

    class JwtUtils {
        -String jwtSecret
        -int jwtExpirationMs
        +generateJwtToken()
        +getUserNameFromJwtToken()
    }

    class PdfService {
        +generatePdf()
    }

    class UserDetailsImpl {
        -Long id
        -String username
        -String email
        -String password
        -Collection authorities
    }

    User "1" -- "1" ERole : has
    User "1" -- "*" Request : creates
    User "1" -- "*" Attestation : creates
    User "1" -- "*" Request : processes
    Request "*" -- "1" User : assigned to
    Attestation "*" -- "1" User : created by
    AuthController ..> User : manages
    UserController ..> User : manages
    RequestController ..> Request : manages
    AttestationController ..> Attestation : manages
    JwtUtils ..> UserDetailsImpl : authenticates
    PdfService ..> Request : generates
``` 