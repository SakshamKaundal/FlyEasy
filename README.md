This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



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
