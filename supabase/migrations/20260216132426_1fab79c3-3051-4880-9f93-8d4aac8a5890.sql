
-- Allow admins to view all conversations
CREATE POLICY "Admins can view all conversations"
ON public.conversations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all conversation members
CREATE POLICY "Admins can view all conversation members"
ON public.conversation_members
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
