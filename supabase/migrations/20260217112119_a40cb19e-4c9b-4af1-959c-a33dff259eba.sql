
-- Student activities table
CREATE TABLE public.student_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text,
  category text NOT NULL,
  members integer NOT NULL DEFAULT 0,
  description text NOT NULL,
  long_description text,
  founded text,
  website text,
  instagram text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view
CREATE POLICY "Authenticated users can view activities"
ON public.student_activities FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can manage
CREATE POLICY "Admins can insert activities"
ON public.student_activities FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update activities"
ON public.student_activities FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete activities"
ON public.student_activities FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Experts table
CREATE TABLE public.experts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar text,
  title text NOT NULL,
  expertise text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 0,
  sessions integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  hourly_rate text,
  linkedin text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view experts"
ON public.experts FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert experts"
ON public.experts FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update experts"
ON public.experts FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete experts"
ON public.experts FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_student_activities_updated_at
BEFORE UPDATE ON public.student_activities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_experts_updated_at
BEFORE UPDATE ON public.experts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with existing hardcoded data
INSERT INTO public.student_activities (name, logo, category, members, description, long_description, founded, website, instagram, email) VALUES
('Tech Innovators Club', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop', 'Technology', 156, 'A community of tech enthusiasts building the future together.', 'Tech Innovators Club is a vibrant community of students and young professionals passionate about technology and innovation. We organize hackathons, coding workshops, and tech talks with industry leaders.', '2020', 'https://techinnovators.club', 'https://instagram.com/techinnovators', 'hello@techinnovators.club'),
('Entrepreneurship Society', 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop', 'Business', 234, 'Empowering the next generation of entrepreneurs and startups.', 'The Entrepreneurship Society connects aspiring founders with mentors, investors, and resources. We host pitch competitions, startup workshops, and networking events.', '2018', NULL, NULL, 'contact@esociety.org'),
('Design Collective', 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=200&h=200&fit=crop', 'Design', 89, 'Where creativity meets purpose. Designers shaping tomorrow.', 'Design Collective brings together graphic designers, UI/UX specialists, and creative minds. We collaborate on projects, share resources, and host design critiques and exhibitions.', '2021', NULL, 'https://instagram.com/designcollective', NULL),
('Green Campus Initiative', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=200&h=200&fit=crop', 'Sustainability', 178, 'Making our campus and community more sustainable.', 'Green Campus Initiative focuses on environmental sustainability through awareness campaigns, recycling programs, and green technology adoption.', '2019', 'https://greencampus.org', NULL, 'green@campus.org');

INSERT INTO public.experts (name, avatar, title, expertise, rating, sessions, is_available, hourly_rate, linkedin, email) VALUES
('Dr. Amanda Foster', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face', 'Startup Advisor & Investor', ARRAY['Fundraising', 'Strategy', 'Scaling'], 4.9, 234, true, '$150/hr', 'https://linkedin.com/in/amandafoster', 'amanda@example.com'),
('James Mitchell', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', 'Senior Product Manager', ARRAY['Product Strategy', 'Agile', 'User Research'], 4.8, 156, true, '$100/hr', NULL, 'james@example.com'),
('Dr. Lisa Chen', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face', 'AI/ML Researcher', ARRAY['Machine Learning', 'Data Science', 'Python'], 4.95, 89, false, '$200/hr', 'https://linkedin.com/in/lisachen', NULL),
('Robert Williams', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face', 'Marketing Director', ARRAY['Brand Strategy', 'Growth Hacking', 'Digital Marketing'], 4.7, 312, true, '$85/hr', NULL, 'robert@example.com');
