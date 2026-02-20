
-- Drop and recreate conversations policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Members can update conversation timestamp" ON public.conversations;

CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), id));
CREATE POLICY "Admins can view all conversations" ON public.conversations FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can update conversation timestamp" ON public.conversations FOR UPDATE TO authenticated USING (is_conversation_member(auth.uid(), id));

-- Drop and recreate conversation_members policies as PERMISSIVE
DROP POLICY IF EXISTS "Conversation creator can add members" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can view members of own conversations" ON public.conversation_members;
DROP POLICY IF EXISTS "Admins can view all conversation members" ON public.conversation_members;

CREATE POLICY "Conversation creator can add members" ON public.conversation_members FOR INSERT TO authenticated WITH CHECK (
  (EXISTS (SELECT 1 FROM conversations WHERE conversations.id = conversation_members.conversation_id AND conversations.created_by = auth.uid()))
  OR (auth.uid() = user_id)
);
CREATE POLICY "Users can view members of own conversations" ON public.conversation_members FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Admins can view all conversation members" ON public.conversation_members FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Drop and recreate messages policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can send messages to own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;

CREATE POLICY "Users can send messages to own conversations" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Users can view messages in own conversations" ON public.messages FOR SELECT TO authenticated USING (is_conversation_member(auth.uid(), conversation_id));
CREATE POLICY "Admins can view all messages" ON public.messages FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
