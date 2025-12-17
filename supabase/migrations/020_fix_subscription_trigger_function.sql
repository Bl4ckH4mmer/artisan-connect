-- Fix for 500 Error on Artisan Signup
-- The previous function lacked schema qualification and search_path, causing it to fail finding the table.

CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.artisan_subscriptions (artisan_id, tier)
  VALUES (NEW.id, 'free')
  ON CONFLICT (artisan_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
