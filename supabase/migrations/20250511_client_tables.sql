-- Create client_users table
CREATE TABLE IF NOT EXISTS public.client_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number TEXT NOT NULL UNIQUE,
  iin TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_requests table
CREATE TABLE IF NOT EXISTS public.client_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.client_users(id),
  phone_number TEXT NOT NULL,
  iin TEXT NOT NULL,
  reason_type TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_client_users_phone_number ON public.client_users(phone_number);
CREATE INDEX IF NOT EXISTS idx_client_requests_phone_number ON public.client_requests(phone_number);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON public.client_requests(status);

-- Row Level Security Policies
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;

-- Policies for client_users
CREATE POLICY "Admins can do everything with client_users"
  ON public.client_users
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Policies for client_requests
CREATE POLICY "Admins can do everything with client_requests"
  ON public.client_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

CREATE POLICY "Partners can view assigned client_requests"
  ON public.client_requests
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid() OR auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));
