
-- Add metadata column to contact_events for storing extra context (e.g. source, device info)
ALTER TABLE public.contact_events 
ADD COLUMN IF NOT EXISTS metadata JSONB;
