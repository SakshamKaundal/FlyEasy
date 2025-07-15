# Flight Management API - Complete Documentation

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Flight Search APIs](#flight-search-apis)
3. [Fare Management APIs](#fare-management-apis)
4. [Booking Management APIs](#booking-management-apis)
5. [Real-time Updates API](#real-time-updates-api)

---

## Authentication APIs

### 1. User Login API

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates users with email and password using Supabase Auth.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

**Response Examples:**

**✅ Success (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing email or password
- **401 Unauthorized:** Invalid credentials or unverified email
- **500 Internal Server Error:** Server error

**Key Features:**
- Integrates with Supabase Authentication
- Handles email verification status
- Returns user object on successful login
- Proper error handling with descriptive messages

---

### 2. User Registration API

**Endpoint:** `POST /api/auth/signup`

**Description:** Registers new users and creates entries in both Supabase Auth and custom users table.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "name": "Jane Doe"
}
```

**Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password
- `name` (string, required): User's full name

**Response Examples:**

**✅ Success (200):**
```json
{
  "message": "Signup successful"
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required fields
- **500 Internal Server Error:** Signup failed or user creation error

**Key Features:**
- Creates user in Supabase Auth
- Automatically creates corresponding entry in `users` table
- Sets `is_admin` to false by default
- Handles duplicate email scenarios
- Comprehensive error handling

---

### 3. JWT Token Generation API

**Endpoint:** `POST /api/auth/token`

**Description:** Generates JWT tokens for authenticated sessions and sets secure HTTP-only cookies.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Parameters:**
- `email` (string, required): User's email address

**Response Examples:**

**✅ Success (200):**
```json
{
  "message": "Token created"
}
```

**Response Headers:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600
```

**❌ Error Responses:**
- **400 Bad Request:** Missing email
- **500 Internal Server Error:** Token generation failed

**Key Features:**
- Uses Jose library for JWT signing
- 1-hour token expiration
- Secure cookie configuration
- Environment-aware security settings
- HTTP-only cookies for XSS protection

---

## Flight Search APIs

### 4. General Flight Search API

**Endpoint:** `POST /api/flights/search`

**Description:** Searches for one-way or round-trip flights with comprehensive filtering and fare information.

**Request Body:**
```json
{
  "from": "NYC",
  "to": "LAX",
  "date": "2024-12-25",
  "returnDate": "2024-12-30"
}
```

**Parameters:**
- `from` (string, required): Origin airport code
- `to` (string, required): Destination airport code
- `date` (string, required): Departure date (YYYY-MM-DD)
- `returnDate` (string, optional): Return date for round-trip

**Response Examples:**

**✅ Success (200):**
```json
{
  "oneWay": [
    {
      "flight_id": "flight-uuid",
      "date": "2024-12-25",
      "from": "NYC",
      "to": "LAX",
      "fare": 299.99,
      "flight_number": "AA101",
      "company_name": "American Airlines",
      "departure_time": "08:00:00",
      "arrival_time": "11:30:00"
    }
  ],
  "return": [
    {
      "flight_id": "flight-uuid-2",
      "date": "2024-12-30",
      "from": "LAX",
      "to": "NYC",
      "fare": 329.99,
      "flight_number": "AA102",
      "company_name": "American Airlines",
      "departure_time": "14:00:00",
      "arrival_time": "22:30:00"
    }
  ]
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required fields
- **500 Internal Server Error:** Database query failed

**Key Features:**
- Supports both one-way and round-trip searches
- Joins flight, journey, and fare data
- Filters by infant economy class fares by default
- Returns comprehensive flight information
- Handles null fare scenarios gracefully

---

### 5. Round-trip Flight Search API

**Endpoint:** `POST /api/flights/round-trip`

**Description:** Specialized search for round-trip flights with enhanced filtering capabilities.

**Request Body:**
```json
{
  "from": "NYC",
  "to": "LAX",
  "outboundDate": "2024-12-25",
  "returnDate": "2024-12-30"
}
```

**Parameters:**
- `from` (string, required): Origin airport code
- `to` (string, required): Destination airport code
- `outboundDate` (string, required): Outbound flight date
- `returnDate` (string, required): Return flight date

**Response Examples:**

**✅ Success (200):**
```json
{
  "flights": [
    {
      "flight_id": "flight-uuid",
      "date": "2024-12-25",
      "from": "NYC",
      "to": "LAX",
      "fare": 299.99,
      "flight_number": "AA101",
      "company_name": "American Airlines"
    }
  ]
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required search parameters
- **500 Internal Server Error:** Server error with detailed message

**Key Features:**
- Strict round-trip validation
- Enhanced error handling with try-catch
- Optimized database queries
- Comprehensive flight information
- TypeScript interface definitions

---

## Fare Management APIs

### 6. Fare Check API

**Endpoint:** `POST /api/fares/check`

**Description:** Retrieves fare information for specific routes and travel classes.

**Request Body:**
```json
{
  "from": "NYC",
  "to": "LAX",
  "travel_class": "economy",
  "passenger_type": "adult"
}
```

**Parameters:**
- `from` (string, required): Origin airport code
- `to` (string, required): Destination airport code
- `travel_class` (string, required): Travel class (economy, premium, business)
- `passenger_type` (string, optional): Passenger type (infant, child, adult) - defaults to "infant"

**Response Examples:**

**✅ Success (200) - Fare Found:**
```json
{
  "fare": 299.99
}
```

**✅ Success (200) - No Fare Found:**
```json
{
  "message": "Class does not exist on that flight",
  "fare": null
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required fields

**Key Features:**
- Flexible passenger type support
- Handles non-existent fare scenarios
- Simple and fast fare lookup
- Supports all travel classes

---

### 7. Flight-specific Fare API

**Endpoint:** `POST /api/fares/flight`

**Description:** Retrieves all passenger type fares for a specific flight and travel class.

**Request Body:**
```json
{
  "flight_number": "AA101",
  "travel_class": "economy"
}
```

**Parameters:**
- `flight_number` (string, required): Flight number
- `travel_class` (string, required): Travel class (economy, premium, business)

**Response Examples:**

**✅ Success (200):**
```json
{
  "fares": {
    "infant": 0,
    "child": 149.99,
    "adult": 299.99
  }
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required fields
- **404 Not Found:** Flight not found
- **500 Internal Server Error:** Failed to fetch fares

**Key Features:**
- Comprehensive fare breakdown by passenger type
- Flight validation before fare lookup
- Journey-aware fare calculation
- Handles missing fare data gracefully

---

## Booking Management APIs

### 8. Create Booking API

**Endpoint:** `POST /api/bookings/create`

**Description:** Creates comprehensive flight bookings with passenger management and seat assignment.

**Request Body:**
```json
{
  "user_id": "user-uuid",
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "flight_id": "flight-uuid",
  "payment_id": "payment-uuid",
  "flight_from": "NYC",
  "flight_to": "LAX",
  "flight_date": "2024-12-25",
  "travel_class": "economy",
  "total_amount": 599.98,
  "passengers": [
    {
      "name": "John Doe",
      "age": "30",
      "gender": "male"
    },
    {
      "name": "Jane Doe",
      "age": "28",
      "gender": "female"
    }
  ]
}
```

**Parameters:**
- `user_id` (string, required): User identifier
- `user_email` (string, required): User's email
- `user_name` (string, required): User's full name
- `flight_id` (string, required): Flight identifier
- `payment_id` (string, optional): Payment transaction ID
- `flight_from` (string, required): Origin airport
- `flight_to` (string, required): Destination airport
- `flight_date` (string, required): Flight date
- `travel_class` (string, required): Travel class
- `total_amount` (number, required): Total booking amount
- `passengers` (array, required): List of passenger objects

**Response Examples:**

**✅ Success (200):**
```json
{
  "message": "Booking successful",
  "booking_id": "booking-uuid"
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required fields with detailed validation
- **500 Internal Server Error:** Database operation failed

**Key Features:**
- Automatic user creation if not exists
- Random seat assignment algorithm
- Primary passenger designation
- Comprehensive field validation
- Transaction-safe booking process
- Detailed error reporting

---

### 9. User Bookings API

**Endpoint:** `POST /api/bookings/user`

**Description:** Retrieves all bookings for a specific user with complete flight and passenger information.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Parameters:**
- `email` (string, required): User's email address

**Response Examples:**

**✅ Success (200):**
```json
{
  "bookings": [
    {
      "id": "booking-uuid",
      "flight_id": "flight-uuid",
      "payment_id": "payment-uuid",
      "payment_status": true,
      "created_at": "2024-12-15T10:30:00Z",
      "travel_class": "economy",
      "total_amount": 599.98,
      "flight": {
        "id": "flight-uuid",
        "flight_number": "AA101",
        "company_name": "American Airlines",
        "departure_time": "08:00:00",
        "arrival_time": "11:30:00"
      },
      "journey": {
        "flight_from": "NYC",
        "flight_to": "LAX",
        "flight_date": "2024-12-25"
      },
      "passengers": [
        {
          "name": "John Doe",
          "age": 30,
          "gender": "male",
          "seat_number": "A12",
          "is_primary": true
        }
      ]
    }
  ]
}
```

**❌ Error Responses:**
- **404 Not Found:** User not found
- **500 Internal Server Error:** Database query failed

**Key Features:**
- Rich data joins across multiple tables
- Complete booking history
- Passenger details included
- Journey information embedded
- Chronological ordering (newest first)
- Handles empty booking lists gracefully

---

### 10. Booking Reschedule API

**Endpoint:** `PATCH /api/bookings/reschedule`

**Description:** Updates flight dates for existing bookings based on passenger name and flight ID.

**Request Body:**
```json
{
  "passenger_name": "John Doe",
  "flight_id": "flight-uuid",
  "new_flight_date": "2024-12-26"
}
```

**Parameters:**
- `passenger_name` (string, required): Name of passenger in booking
- `flight_id` (string, required): Current flight identifier
- `new_flight_date` (string, required): New flight date

**Response Examples:**

**✅ Success (200):**
```json
{
  "message": "Booking date updated successfully",
  "updatedBooking": {
    "id": "booking-uuid",
    "flight_date": "2024-12-26",
    "updated_at": "2024-12-15T10:30:00Z"
  }
}
```

**❌ Error Responses:**
- **400 Bad Request:** Missing required fields
- **404 Not Found:** Passenger or booking not found
- **500 Internal Server Error:** Update operation failed

**Key Features:**
- Passenger-based booking lookup
- Flight validation before update
- Atomic update operations
- Comprehensive error handling
- Returns updated booking details

---

## Real-time Updates API

### 11. Booking Updates SSE API

**Endpoint:** `GET /api/bookings/updates`

**Description:** Provides real-time booking updates using Server-Sent Events (SSE) with polling mechanism.

**Request:** No body required (GET request)

**Response Stream Examples:**

**Connection Established:**
```
data: {"type":"connected","timestamp":"2024-12-15T10:30:00Z"}

```

**Heartbeat Message:**
```
data: {"type":"heartbeat","timestamp":"2024-12-15T10:30:05Z","lastCheck":"2024-12-15T10:30:00Z"}

```

**Booking Update:**
```
data: {"type":"update","data":[{"id":"booking-uuid","updated_at":"2024-12-15T10:30:03Z"}],"timestamp":"2024-12-15T10:30:05Z"}

```

**Error Message:**
```
data: {"type":"error","message":"Polling failed"}

```

**Response Headers:**
```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Cache-Control
```

**Key Features:**
- Real-time booking change notifications
- 5-second polling interval
- Automatic connection management
- Heartbeat for connection health
- Graceful error handling
- Client disconnect detection
- Timestamp-based change tracking

---

## Common Features Across All APIs

### Error Handling
- Consistent error response format
- Proper HTTP status codes
- Detailed error messages
- Graceful fallback handling

### Security
- JWT token authentication
- HTTP-only secure cookies
- Input validation
- SQL injection prevention through Supabase

### Database Integration
- Supabase as primary database
- Proper relationship handling
- Transaction safety
- Connection pooling

### Performance
- Efficient database queries
- Proper indexing considerations
- Minimal data transfer
- Connection reuse

### Scalability
- Stateless design
- Database-backed persistence
- Real-time capabilities
- Horizontal scaling ready

---

## API Usage Examples

### Complete Booking Flow
```javascript
// 1. User login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

// 2. Search flights
const searchResponse = await fetch('/api/flights/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'NYC',
    to: 'LAX',
    date: '2024-12-25'
  })
});

// 3. Check fares
const fareResponse = await fetch('/api/fares/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'NYC',
    to: 'LAX',
    travel_class: 'economy',
    passenger_type: 'adult'
  })
});

// 4. Create booking
const bookingResponse = await fetch('/api/bookings/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user-uuid',
    user_email: 'user@example.com',
    user_name: 'John Doe',
    flight_id: 'flight-uuid',
    flight_from: 'NYC',
    flight_to: 'LAX',
    flight_date: '2024-12-25',
    travel_class: 'economy',
    total_amount: 299.99,
    passengers: [
      { name: 'John Doe', age: '30', gender: 'male' }
    ]
  })
});
```

### Real-time Updates
```javascript
const eventSource = new EventSource('/api/bookings/updates');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'connected':
      console.log('Connected to real-time updates');
      break;
    case 'update':
      console.log('Booking updates:', data.data);
      break;
    case 'error':
      console.error('Update error:', data.message);
      break;
  }
};
```

This comprehensive documentation covers all 11 APIs with detailed explanations, examples, and usage patterns. Each API is fully documented with request/response formats, error handling, and key features.


## 🛫 Flight Booking System – Database Schema Documentation

This project uses a relational database (PostgreSQL via Supabase) to manage a full-fledged **flight booking system**. Below is a complete explanation of the database schema, written to help both developers and reviewers understand the system design.

---

### 📦 Tables Overview

The schema consists of the following core tables:

* `users` – stores registered user data
* `flights` – stores individual flight info
* `journeys` – links flights to specific travel dates and routes
* `fare_rules` – pricing rules based on passenger type and class
* `bookings` – user bookings for flights
* `passengers` – individual passengers tied to a booking

---

## 🧑‍💼 `users` Table

Stores information about users registered in the system. This table references Supabase's `auth.users` table for authentication.

| Column     | Type      | Description                                     |
| ---------- | --------- | ----------------------------------------------- |
| `id`       | `uuid`    | Primary key; also foreign key from `auth.users` |
| `name`     | `text`    | Name of the user                                |
| `email`    | `text`    | User's email address (must be unique)           |
| `is_admin` | `boolean` | Marks if the user is an admin (default: false)  |

---

## ✈️ `flights` Table

Stores general information about a flight (not tied to a specific date).

| Column           | Type   | Description                 |
| ---------------- | ------ | --------------------------- |
| `id`             | `uuid` | Primary key                 |
| `company_name`   | `text` | Name of the airline company |
| `flight_number`  | `text` | Flight number (e.g. AI-202) |
| `departure_time` | `time` | Scheduled departure time    |
| `arrival_time`   | `time` | Scheduled arrival time      |

---

## 🧝 `journeys` Table

Represents a specific flight journey between two locations on a specific date.

| Column        | Type   | Description                    |
| ------------- | ------ | ------------------------------ |
| `id`          | `uuid` | Primary key                    |
| `flight_id`   | `uuid` | Foreign key to `flights` table |
| `flight_from` | `text` | Departure city                 |
| `flight_to`   | `text` | Arrival city                   |
| `flight_date` | `date` | Journey date                   |

---

## 💸 `fare_rules` Table

Defines pricing rules based on origin, destination, class of travel, and passenger type.

| Column           | Type      | Description                                     |
| ---------------- | --------- | ----------------------------------------------- |
| `id`             | `uuid`    | Primary key                                     |
| `flight_from`    | `text`    | Departure city                                  |
| `flight_to`      | `text`    | Arrival city                                    |
| `travel_class`   | `text`    | Travel class (`economy`, `premium`, `business`) |
| `passenger_type` | `text`    | Passenger type (`adult`, `child`, `infant`)     |
| `base_price`     | `numeric` | Base fare for this combination                  |

---

## 💼 `bookings` Table

Stores confirmed bookings made by users for flights.

| Column           | Type        | Description                                     |
| ---------------- | ----------- | ----------------------------------------------- |
| `id`             | `uuid`      | Primary key                                     |
| `user_id`        | `uuid`      | Foreign key to `users`                          |
| `flight_id`      | `uuid`      | Foreign key to `flights`                        |
| `payment_status` | `boolean`   | True if paid, false otherwise                   |
| `payment_id`     | `text`      | Reference ID from payment gateway               |
| `created_at`     | `timestamp` | When the booking was made                       |
| `updated_at`     | `timestamp` | Last updated time                               |
| `flight_from`    | `text`      | Departure city (redundant for convenience)      |
| `flight_to`      | `text`      | Arrival city                                    |
| `flight_date`    | `date`      | Date of travel                                  |
| `travel_class`   | `text`      | Class chosen (`economy`, `premium`, `business`) |
| `total_amount`   | `numeric`   | Final total fare                                |

---

## 👥 `passengers` Table

Lists all passengers for each booking. A booking can have multiple passengers.

| Column        | Type      | Description                                    |
| ------------- | --------- | ---------------------------------------------- |
| `id`          | `uuid`    | Primary key                                    |
| `booking_id`  | `uuid`    | Foreign key to `bookings` table                |
| `name`        | `text`    | Full name of passenger                         |
| `age`         | `integer` | Age of the passenger                           |
| `gender`      | `text`    | Gender of the passenger                        |
| `seat_number` | `text`    | Assigned seat number (optional)                |
| `is_primary`  | `boolean` | Marks the main contact person (default: false) |

---

## 📄 Notes

* All tables use `uuid` as primary keys for secure and scalable identification.
* Foreign key constraints ensure relational integrity.
* ENUMs and `CHECK` constraints are used to ensure data consistency (e.g., travel class, passenger type).
* `created_at` and `updated_at` fields help track booking activity.

---

> This schema is optimized for simplicity and clarity while supporting future scalability.

Feel free to contribute or adapt this database structure for your own flight or booking-based systems.
