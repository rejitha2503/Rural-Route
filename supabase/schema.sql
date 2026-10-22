-- ====================================================================
-- RuralRoute: Bus Information System for Tamil Nadu (Pilot Corridor: Kovilpatti <-> Sankarankovil)
-- Production Supabase PostgreSQL Schema with Hardened Row Level Security (RLS)
-- NOTE: Review and test thoroughly in a staging environment before running in production.
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('passenger', 'staff', 'verifier', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('verified', 'pending_verification', 'needs_reverification', 'unverified');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE update_type AS ENUM ('delay', 'cancellation', 'route_diverted', 'platform_change');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE operator_type AS ENUM ('TNSTC', 'SETC', 'Private');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. USER PROFILES (Linked directly to Supabase Auth: supports Phone and Email users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE,
  email TEXT,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'passenger',
  depot TEXT,
  preferred_corridor TEXT DEFAULT 'Kovilpatti ↔ Sankarankovil',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT identity_check CHECK (phone IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT email_valid CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 4. OPERATORS (Defined before bus_services to satisfy foreign key constraints)
CREATE TABLE IF NOT EXISTS public.operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  name_ta TEXT NOT NULL CHECK (length(trim(name_ta)) > 0),
  type operator_type NOT NULL DEFAULT 'TNSTC',
  depot TEXT NOT NULL CHECK (length(trim(depot)) > 0),
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. BUS STOPS (Includes coordinates and verified physical location constraints)
CREATE TABLE IF NOT EXISTS public.stops (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL CHECK (length(trim(name_en)) > 0),
  name_ta TEXT NOT NULL CHECK (length(trim(name_ta)) > 0),
  code TEXT UNIQUE NOT NULL CHECK (length(trim(code)) > 0),
  latitude DOUBLE PRECISION CHECK (latitude IS NULL OR (latitude BETWEEN -90.0 AND 90.0)),
  longitude DOUBLE PRECISION CHECK (longitude IS NULL OR (longitude BETWEEN -180.0 AND 180.0)),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  landmark_en TEXT,
  landmark_ta TEXT,
  district TEXT NOT NULL CHECK (length(trim(district)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. DATA SOURCES
CREATE TABLE IF NOT EXISTS public.data_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  type TEXT NOT NULL CHECK (type IN ('official_tnstc', 'depot_notice_board', 'bus_stand_inquiry', 'field_survey', 'passenger_report')),
  trust_score INT NOT NULL CHECK (trust_score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BUS SERVICES (Timetable records with strict validity and timing constraints)
CREATE TABLE IF NOT EXISTS public.bus_services (
  id TEXT PRIMARY KEY,
  service_number TEXT NOT NULL CHECK (length(trim(service_number)) > 0),
  route_number TEXT NOT NULL CHECK (length(trim(route_number)) > 0),
  operator_id TEXT REFERENCES public.operators(id) ON DELETE SET NULL,
  origin_stop_id TEXT NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  destination_stop_id TEXT NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  via_summary_en TEXT NOT NULL CHECK (length(trim(via_summary_en)) > 0),
  via_summary_ta TEXT NOT NULL CHECK (length(trim(via_summary_ta)) > 0),
  service_type TEXT NOT NULL CHECK (service_type IN ('Ordinary', 'Express', 'Deluxe / Point-to-Point', 'Town Bus')),
  service_days TEXT[] NOT NULL DEFAULT ARRAY['Daily'],
  departure_time TEXT NOT NULL CHECK (departure_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  estimated_arrival_time TEXT NOT NULL CHECK (estimated_arrival_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  boarding_point_en TEXT NOT NULL CHECK (length(trim(boarding_point_en)) > 0),
  boarding_point_ta TEXT NOT NULL CHECK (length(trim(boarding_point_ta)) > 0),
  boarding_bay TEXT,
  intermediate_stops JSONB NOT NULL DEFAULT '[]'::JSONB,
  source_id TEXT REFERENCES public.data_sources(id) ON DELETE SET NULL,
  verification_status verification_status NOT NULL DEFAULT 'pending_verification',
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  verified_by TEXT,
  verifier_notes TEXT,
  submission_notes TEXT,
  submitted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (valid_until >= last_verified_at)
);

-- 8. TRIP UPDATES (Delays & Cancellations with expiry constraints)
CREATE TABLE IF NOT EXISTS public.trip_updates (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL REFERENCES public.bus_services(id) ON DELETE CASCADE,
  update_type update_type NOT NULL,
  delay_minutes INT CHECK (delay_minutes IS NULL OR delay_minutes >= 0),
  reason_en TEXT NOT NULL CHECK (length(trim(reason_en)) > 0),
  reason_ta TEXT NOT NULL CHECK (length(trim(reason_ta)) > 0),
  publisher_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  publisher_name TEXT NOT NULL,
  publisher_role user_role NOT NULL,
  source TEXT NOT NULL CHECK (length(trim(source)) > 0),
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'expired')),
  admin_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT valid_alert_expiry CHECK (expires_at > reported_at)
);

-- 9. PASSENGER REPORTS
CREATE TABLE IF NOT EXISTS public.passenger_reports (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  route_or_service TEXT NOT NULL CHECK (length(trim(route_or_service)) > 0),
  report_type TEXT NOT NULL CHECK (report_type IN ('missing_bus', 'wrong_timing', 'boarding_point_change', 'cancelled_without_notice')),
  details TEXT NOT NULL CHECK (length(trim(details)) > 0),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'verified_and_updated', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT LOGS (Append-only immutable record)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role user_role NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR FAST PASSENGER ROUTE SEARCHES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_services_corridor ON public.bus_services(origin_stop_id, destination_stop_id);
CREATE INDEX IF NOT EXISTS idx_services_verification_active ON public.bus_services(verification_status, valid_until) WHERE verification_status = 'verified';
CREATE INDEX IF NOT EXISTS idx_updates_active ON public.trip_updates(service_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_stops_lookup ON public.stops(code, district);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);

-- ====================================================================
-- SECURITY DEFINER HELPER FUNCTIONS (Prevents RLS Infinite Recursion)
-- ====================================================================

-- Function to safely fetch the calling user's role without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_verifier()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('verifier', 'admin')
  );
$$;

-- ====================================================================
-- TRIGGERS: AUTOMATIC SIGNUP ROLE ENFORCEMENT & IMMUTABILITY
-- ====================================================================

-- 1. Automatically create user profile with strictly 'passenger' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, phone, email, full_name, role, preferred_corridor)
  VALUES (
    NEW.id,
    NEW.phone,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Passenger'),
    'passenger', -- NEVER allow the client to assign staff/admin during signup!
    COALESCE(NEW.raw_user_meta_data->>'preferred_corridor', 'Kovilpatti ↔ Sankarankovil')
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Prevent non-admins from changing roles in user_profiles
CREATE OR REPLACE FUNCTION public.protect_user_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Unauthorized: Only system administrators can assign or alter user roles.';
    END IF;
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_role_change ON public.user_profiles;
CREATE TRIGGER trg_protect_user_role_change
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_role_change();

-- 3. Prevent updates or deletions on audit_logs (append-only security)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_tampering()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records are immutable and cannot be altered or removed.';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_log_tampering ON public.audit_logs;
CREATE TRIGGER trg_prevent_audit_log_tampering
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_tampering();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passenger_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------
-- A. USER PROFILES POLICIES
-- --------------------------------------------------------------------

-- Users can view their own profile; staff, verifiers, and admins can view profiles
CREATE POLICY "Users can view relevant profiles" ON public.user_profiles
  FOR SELECT USING (
    id = auth.uid() OR public.is_staff() OR public.is_verifier()
  );

-- Users can update their own non-role fields (role change is intercepted by trigger)
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    id = auth.uid() OR public.is_admin()
  );

-- --------------------------------------------------------------------
-- B. STOPS, OPERATORS & DATA SOURCES (Public Reference Data)
-- --------------------------------------------------------------------

CREATE POLICY "Public read for operators" ON public.operators FOR SELECT USING (true);
CREATE POLICY "Admin write for operators" ON public.operators FOR ALL USING (public.is_admin());

CREATE POLICY "Public read for stops" ON public.stops FOR SELECT USING (true);
CREATE POLICY "Admin write for stops" ON public.stops FOR ALL USING (public.is_admin());

CREATE POLICY "Public read for data sources" ON public.data_sources FOR SELECT USING (true);
CREATE POLICY "Admin write for data sources" ON public.data_sources FOR ALL USING (public.is_admin());

-- --------------------------------------------------------------------
-- C. BUS SERVICES (Timetable Data & Verification)
-- --------------------------------------------------------------------

-- Public can SELECT ONLY approved and unexpired services.
-- 'needs_reverification' and 'pending_verification' are NOT shown to the public!
-- Authenticated staff, verifiers, and admins can view all statuses.
CREATE POLICY "Public can view only approved unexpired services" ON public.bus_services
  FOR SELECT USING (
    (verification_status = 'verified' AND valid_until > NOW())
    OR public.is_staff() 
    OR public.is_verifier()
  );

-- Only authenticated STAFF (or admins) can insert new services,
-- and they can ONLY insert as 'pending_verification'.
CREATE POLICY "Staff can submit pending services only" ON public.bus_services
  FOR INSERT WITH CHECK (
    public.is_staff() 
    AND verification_status = 'pending_verification'
    AND submitted_by_user_id = auth.uid()
  );

-- Only VERIFIERS and ADMINS can update verification status or published data.
-- Staff cannot self-approve their own submissions.
CREATE POLICY "Verifiers and admins can update bus services" ON public.bus_services
  FOR UPDATE USING (
    public.is_verifier()
  ) WITH CHECK (
    public.is_verifier()
  );

-- Only Admins can delete bus service entries
CREATE POLICY "Admins can delete bus services" ON public.bus_services
  FOR DELETE USING (
    public.is_admin()
  );

-- --------------------------------------------------------------------
-- D. TRIP UPDATES (Urgent Delays & Cancellations)
-- --------------------------------------------------------------------

-- Public can view only active, non-expired trip alerts
CREATE POLICY "Public can view active unexpired trip updates" ON public.trip_updates
  FOR SELECT USING (
    (status = 'active' AND expires_at > NOW())
    OR public.is_staff()
    OR public.is_verifier()
  );

-- Authorized staff or admins can insert trip updates with their user ID
CREATE POLICY "Staff can insert trip updates" ON public.trip_updates
  FOR INSERT WITH CHECK (
    public.is_staff() 
    AND publisher_user_id = auth.uid()
  );

-- Staff can update alerts they published; admins can update all alerts
CREATE POLICY "Staff and admin can update trip updates" ON public.trip_updates
  FOR UPDATE USING (
    publisher_user_id = auth.uid() OR public.is_admin()
  );

-- --------------------------------------------------------------------
-- E. PASSENGER REPORTS (Crowdsourced Inquiries)
-- --------------------------------------------------------------------

-- Anyone (even guest users without account) can insert a report
CREATE POLICY "Anyone can submit passenger reports" ON public.passenger_reports
  FOR INSERT WITH CHECK (true);

-- Passengers can view their own submitted reports; staff/verifiers/admins can view all
CREATE POLICY "Staff and owners can view passenger reports" ON public.passenger_reports
  FOR SELECT USING (
    (user_id IS NOT NULL AND user_id = auth.uid()) 
    OR public.is_staff() 
    OR public.is_verifier()
  );

-- Verifiers and Admins can update the status of passenger reports
CREATE POLICY "Verifiers and admins can update reports" ON public.passenger_reports
  FOR UPDATE USING (
    public.is_verifier()
  );

-- --------------------------------------------------------------------
-- F. AUDIT LOGS (Immutable System History)
-- --------------------------------------------------------------------

-- Only Verifiers and Admins can view audit logs
CREATE POLICY "Verifiers and admins can read audit logs" ON public.audit_logs
  FOR SELECT USING (
    public.is_verifier()
  );

-- Authenticated staff, verifiers, and admins can insert audit records
CREATE POLICY "Authenticated actors can write audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
  );
