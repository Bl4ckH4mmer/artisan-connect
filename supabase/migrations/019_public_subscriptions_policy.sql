-- Allow public to view subscriptions (required for badges on profile page)
CREATE POLICY "Public can view artisan subscriptions"
ON artisan_subscriptions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM artisan_profiles
    WHERE artisan_profiles.id = artisan_subscriptions.artisan_id
    AND artisan_profiles.status = 'active'
  )
);
