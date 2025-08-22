
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Flights Table
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    flight_number VARCHAR(50) NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL
);

-- Journeys Table
CREATE TABLE journeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_id UUID REFERENCES flights(id),
    flight_from VARCHAR(255) NOT NULL,
    flight_to VARCHAR(255) NOT NULL,
    flight_date DATE NOT NULL
);

-- FareRules Table
CREATE TABLE fare_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_from VARCHAR(255) NOT NULL,
    flight_to VARCHAR(255) NOT NULL,
    travel_class VARCHAR(50) NOT NULL,
    passenger_type VARCHAR(50) NOT NULL,
    base_price NUMERIC(10, 2) NOT NULL
);

-- Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    flight_id UUID REFERENCES journeys(id),
    payment_status BOOLEAN DEFAULT FALSE,
    payment_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Passengers Table
CREATE TABLE passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(50) NOT NULL,
    seat_number VARCHAR(10),
    is_primary BOOLEAN DEFAULT FALSE
);
