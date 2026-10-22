import React, { useState } from 'react';
import { X, Copy, Check, Database, Shield, Key } from 'lucide-react';
import { Language } from '../types';

interface DatabaseSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const SUPABASE_SCHEMA_PREVIEW = `-- RuralRoute Hardened Supabase PostgreSQL DDL with RLS Policies
-- (Full file with all tables, triggers, and indices at supabase/schema.sql)

-- 1. OPERATORS (Defined before bus_services for foreign key integrity)
CREATE TABLE operators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'TNSTC',
  depot TEXT NOT NULL,
  contact_phone TEXT
);

-- 2. USER PROFILES (Linked to auth.users with trigger-enforced role)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'passenger',
  depot TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUS SERVICES (Public sees ONLY verified unexpired services)
CREATE TABLE bus_services (
  id TEXT PRIMARY KEY,
  service_number TEXT NOT NULL,
  route_number TEXT NOT NULL,
  operator_id TEXT REFERENCES operators(id) ON DELETE SET NULL,
  origin_stop_id TEXT NOT NULL REFERENCES stops(id),
  destination_stop_id TEXT NOT NULL REFERENCES stops(id),
  service_type TEXT NOT NULL,
  departure_time TEXT NOT NULL,
  estimated_arrival_time TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'pending_verification',
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  submitted_by_user_id UUID REFERENCES auth.users(id),
  CONSTRAINT valid_date_range CHECK (valid_until >= last_verified_at)
);

-- 4. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE bus_services ENABLE ROW LEVEL SECURITY;

-- Public can SELECT ONLY approved and unexpired services
CREATE POLICY "Public can view only approved unexpired services" ON bus_services
  FOR SELECT USING (
    (verification_status = 'verified' AND valid_until > NOW())
    OR public.is_staff() OR public.is_verifier()
  );

-- Only authenticated STAFF can insert pending services
CREATE POLICY "Staff can submit pending services only" ON bus_services
  FOR INSERT WITH CHECK (
    public.is_staff() 
    AND verification_status = 'pending_verification'
    AND submitted_by_user_id = auth.uid()
  );

-- Only VERIFIERS & ADMINS can update verification status
CREATE POLICY "Verifiers and admins can update bus services" ON bus_services
  FOR UPDATE USING (public.is_verifier()) WITH CHECK (public.is_verifier());

-- Audit log immutability trigger prevents tampering
CREATE TRIGGER trg_prevent_audit_log_tampering
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_tampering();`;


export const DatabaseSchemaModal: React.FC<DatabaseSchemaModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_PREVIEW);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schema-modal-title"
      >
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 id="schema-modal-title" className="text-base font-bold text-white">
                Supabase PostgreSQL Schema & RLS Architecture
              </h3>
              <p className="text-xs text-slate-300">
                Production relational design with server-side Row Level Security
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* Security & RLS Explanation */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Row Level Security (RLS) Policy Highlights</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-700 text-xs">
              <li><strong>Passenger Role:</strong> Unauthenticated public users can only SELECT rows where <code className="bg-white px-1 py-0.5 rounded border border-emerald-200">verification_status = 'verified'</code>.</li>
              <li><strong>Staff Role:</strong> Authenticated depot staff can INSERT new bus timetable records strictly as <code className="bg-white px-1 py-0.5 rounded border border-emerald-200">'pending_verification'</code>, and publish urgent delay alerts.</li>
              <li><strong>Verifier Role:</strong> Authorized verifiers have UPDATE permission on <code className="bg-white px-1 py-0.5 rounded border border-emerald-200">bus_services</code> to transition records to 'verified' or 'needs_reverification'.</li>
              <li><strong>Never Expose Service Key:</strong> Client uses only the anonymous public key; permissions are enforced by PostgreSQL server policies.</li>
            </ul>
          </div>

          {/* DDL Code Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                PostgreSQL DDL & RLS Policies (Preview):
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1 rounded-md font-bold text-xs flex items-center gap-1 border border-slate-300 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
              {SUPABASE_SCHEMA_PREVIEW}
            </pre>
            <p className="text-[11px] text-slate-500 mt-1">
              Full script including all 10 tables, triggers, indexes, and seed records is located in <code className="text-slate-800 font-mono">/supabase/schema.sql</code>.
            </p>
          </div>

          {/* Supabase Environment & Dashboard Setup Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs">
              <Key className="w-4 h-4 text-emerald-600" />
              <span>Supabase Environment Configuration Status</span>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">VITE_SUPABASE_URL:</span>
                <code className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not set'}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-600">VITE_SUPABASE_ANON_KEY:</span>
                <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-mono">
                  {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured (Publishable key detected)' : 'Missing'}
                </span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="font-bold text-slate-800">
                To activate Phone + Password authentication in your Supabase project:
              </div>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Log in to your <strong>Supabase Dashboard</strong> at <code>https://supabase.com/dashboard</code>.</li>
                <li>Go to <strong>Authentication → Providers → Phone</strong>.</li>
                <li>Turn ON <strong>Enable Phone provider</strong>.</li>
                <li>Toggle OFF <strong>Enable phone confirmations</strong> (to allow direct phone+password login without waiting for SMS OTP), or configure an SMS provider like Twilio or MessageBird.</li>
                <li>Open <strong>SQL Editor</strong> in Supabase and paste the contents of <code>supabase/schema.sql</code> to create the user profiles and transit tables.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
