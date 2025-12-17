-- Add type column to contact_events if it doesn't exist
ALTER TABLE public.contact_events 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'whatsapp';

-- Add constraint to ensure valid types if needed, but keeping it flexible for now
-- CHECK (type IN ('whatsapp', 'call', 'email'))
