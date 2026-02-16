
-- Allow all authenticated users to view all profiles (needed for community/messaging)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);
