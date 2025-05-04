# Cowm Fees Management System

A Spring Boot application for managing fees and payments in a housing complex.

## Project Structure

```
src/main/java/com/bluemoon/fees/
├── config/         # Configuration classes
├── controller/     # REST controllers
├── dto/           # Data Transfer Objects
├── entity/        # JPA entities
├── exception/     # Exception handling
├── repository/    # JPA repositories
├── security/      # Security configuration
└── service/       # Business logic
```

## Technologies Used

- Spring Boot
- Spring Security with JWT
- Spring Data JPA
- PostgreSQL
- Lombok
- Maven

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
- **Request Body:**
```json
{
    "username": "string",
    "password": "string",
    "email": "string",
    "fullName": "string"
}
```
- **Response:**
```json
{
    "token": "string",
    "username": "string",
    "role": "string"
}
```

#### Login
- **POST** `/api/auth/login`
- **Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```
- **Response:**
```json
{
    "token": "string",
    "username": "string",
    "role": "string"
}
```

#### Change Password
- **POST** `/api/auth/change-password`
- **Parameters:**
  - `userId`: Long
  - `oldPassword`: String
  - `newPassword`: String
- **Response:** 200 OK

### Fees Management (`/api/fees`)

#### Get All Fees
- **GET** `/api/fees`
- **Response:**
```json
[
    {
        "id": "number",
        "name": "string",
        "type": "string",
        "amount": "number",
        "dueDate": "date",
        "description": "string",
        "active": "boolean"
    }
]
```

#### Get Fee by ID
- **GET** `/api/fees/{id}`
- **Response:**
```json
{
    "id": "number",
    "name": "string",
    "type": "string",
    "amount": "number",
    "dueDate": "date",
    "description": "string",
    "active": "boolean"
}
```

#### Create Fee
- **POST** `/api/fees`
- **Request Body:**
```json
{
    "name": "string",
    "type": "string",
    "amount": "number",
    "dueDate": "date",
    "description": "string"
}
```
- **Response:** Created fee object

#### Update Fee
- **PUT** `/api/fees/{id}`
- **Request Body:**
```json
{
    "name": "string",
    "type": "string",
    "amount": "number",
    "dueDate": "date",
    "description": "string"
}
```
- **Response:** Updated fee object

#### Deactivate Fee
- **DELETE** `/api/fees/{id}`
- **Response:** 200 OK

#### Activate Fee
- **PUT** `/api/fees/{id}/activate`
- **Response:** 200 OK

### Payments Management (`/api/payments`)

#### Get All Payments
- **GET** `/api/payments`
- **Response:**
```json
[
    {
        "id": "number",
        "feeId": "number",
        "householdId": "number",
        "amount": "number",
        "paymentDate": "date",
        "status": "string",
        "active": "boolean"
    }
]
```

#### Get Payment by ID
- **GET** `/api/payments/{id}`
- **Response:**
```json
{
    "id": "number",
    "feeId": "number",
    "householdId": "number",
    "amount": "number",
    "paymentDate": "date",
    "status": "string",
    "active": "boolean"
}
```

#### Create Payment
- **POST** `/api/payments`
- **Request Body:**
```json
{
    "feeId": "number",
    "householdId": "number",
    "amount": "number",
    "paymentDate": "date",
    "status": "string"
}
```
- **Response:** Created payment object

#### Update Payment
- **PUT** `/api/payments/{id}`
- **Request Body:**
```json
{
    "feeId": "number",
    "householdId": "number",
    "amount": "number",
    "paymentDate": "date",
    "status": "string"
}
```
- **Response:** Updated payment object

#### Deactivate Payment
- **DELETE** `/api/payments/{id}`
- **Response:** 200 OK

#### Activate Payment
- **PUT** `/api/payments/{id}/activate`
- **Response:** 200 OK

## Security

The application uses JWT (JSON Web Token) for authentication. All endpoints except `/api/auth/**` and `/api/public/**` require authentication.

### JWT Token Format
- Bearer token in Authorization header
- Format: `Bearer <token>`

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
    "timestamp": "date",
    "status": 400,
    "error": "Bad Request",
    "message": "string"
}
```

### 401 Unauthorized
```json
{
    "timestamp": "date",
    "status": 401,
    "error": "Unauthorized",
    "message": "Invalid username or password"
}
```

### 403 Forbidden
```json
{
    "timestamp": "date",
    "status": 403,
    "error": "Forbidden",
    "message": "Access denied"
}
```

### 500 Internal Server Error
```json
{
    "timestamp": "date",
    "status": 500,
    "error": "Internal Server Error",
    "message": "An unexpected error occurred"
}
```

## Database Schema

### User
- id: Long (PK)
- username: String (unique)
- password: String
- role: String
- email: String
- fullName: String
- enabled: Boolean

### Fee
- id: Long (PK)
- name: String
- type: String
- amount: BigDecimal
- dueDate: LocalDate
- description: String
- active: Boolean

### Payment
- id: Long (PK)
- feeId: Long (FK)
- householdId: Long (FK)
- amount: BigDecimal
- paymentDate: LocalDate
- status: String
- active: Boolean

### Household
- id: Long (PK)
- ownerName: String
- address: String
- active: Boolean

## Setup and Running

1. Clone the repository
2. Configure database connection in `application.properties`
3. Run `mvn spring-boot:run`
4. Access the API at `http://localhost:8080` 