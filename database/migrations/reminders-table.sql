-- Create reminders table for calendar functionality
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text NOT NULL,
  description text,
  reminder_date date NOT NULL,
  reminder_time time,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reminders_pkey PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reminders_user_id_idx ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS reminders_reminder_date_idx ON public.reminders(reminder_date);
CREATE INDEX IF NOT EXISTS reminders_user_date_idx ON public.reminders(user_id, reminder_date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can only insert their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can only update their own reminders" ON public.reminders;
DROP POLICY IF EXISTS "Users can only delete their own reminders" ON public.reminders;

-- Create RLS policies for Clerk authentication (using user_id as text)
CREATE POLICY "Users can only see their own reminders" ON public.reminders
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can only insert their own reminders" ON public.reminders
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can only update their own reminders" ON public.reminders
  FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can only delete their own reminders" ON public.reminders
  FOR DELETE USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create or replace trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_reminders_updated_at ON public.reminders;
CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON public.reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
