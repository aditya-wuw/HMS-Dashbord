-- Hospital Management System (HMS) PostgreSQL Schema DDL
-- Compatible with Neon Postgres

-- Enable UUID generation support (if not already enabled)
-- Note: Neon PostgreSQL has gen_random_uuid() built-in (PG13+), so this is fallback-safe.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trigger function to automatically update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. PATIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    medical_history TEXT DEFAULT '',
    emergency_contact VARCHAR(100),
    allergies TEXT[] DEFAULT '{}'::text[],
    current_medications TEXT[] DEFAULT '{}'::text[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. STAFF TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    staff_id VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Doctor', 'Nurse', 'Receptionist', 'Lab Technician', 'Admin', 'Other')),
    department VARCHAR(50) NOT NULL CHECK (department IN ('Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Gynecology', 'General', 'Emergency', 'Administration')),
    contact_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    joining_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    qualification VARCHAR(255),
    schedule JSONB DEFAULT '[]'::jsonb, -- Array of schedules: { day, startTime, endTime }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_staff_updated_at
BEFORE UPDATE ON staff
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. ADMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    admitted_by UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    room_number VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    admission_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    discharge_date TIMESTAMP WITH TIME ZONE,
    diagnosis TEXT NOT NULL,
    treatment_plan TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Admitted' CHECK (status IN ('Admitted', 'Discharged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_admissions_updated_at
BEFORE UPDATE ON admissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. APPOINTMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No-Show')),
    purpose TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. ATTENDANCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in VARCHAR(50) NOT NULL,
    check_out VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Late', 'Half Day', 'On Leave')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Prevent duplicate attendance records for the same staff on the same date
    CONSTRAINT unique_staff_date UNIQUE (staff_id, date)
);

CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON attendance
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. BILLS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    admission_id UUID REFERENCES admissions(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    bill_type VARCHAR(50) NOT NULL CHECK (bill_type IN ('Consultation', 'Room Charge', 'Laboratory', 'Medication', 'Other', 'Surgery', 'Lab Test')),
    items JSONB DEFAULT '[]'::jsonb, -- Array of items: { name, description, quantity, unitPrice, amount }
    payments JSONB DEFAULT '[]'::jsonb, -- Array of payments: { amount, date, method }
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Partial', 'Paid', 'Overdue')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('Cash', 'Credit Card', 'Debit Card', 'Insurance', 'Online Payment')),
    bill_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON bills
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. INSURANCE CLAIMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS insurance_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    insurance_provider VARCHAR(255) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    claim_amount NUMERIC(12, 2) NOT NULL,
    approved_amount NUMERIC(12, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Process', 'Approved', 'Rejected', 'Partially Approved')),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approval_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_insurance_claims_updated_at
BEFORE UPDATE ON insurance_claims
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. USERS TABLE FOR AUTHENTICATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

