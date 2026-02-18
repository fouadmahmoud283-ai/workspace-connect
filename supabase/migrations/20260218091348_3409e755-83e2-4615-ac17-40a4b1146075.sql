
-- Create spaces table for workspace management
CREATE TABLE public.spaces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  location text NOT NULL,
  image text,
  amenities text[] NOT NULL DEFAULT '{}',
  available boolean NOT NULL DEFAULT true,
  price text NOT NULL,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  open_hours text NOT NULL DEFAULT '8:00 AM - 10:00 PM',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view
CREATE POLICY "Authenticated users can view spaces" ON public.spaces FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage
CREATE POLICY "Admins can insert spaces" ON public.spaces FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update spaces" ON public.spaces FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete spaces" ON public.spaces FOR DELETE USING (has_role(auth.uid(), 'admin'));

-- Auto update timestamps
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
