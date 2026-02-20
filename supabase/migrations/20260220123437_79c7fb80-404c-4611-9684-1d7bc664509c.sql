
-- Force drop all conversation policies completely
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.conversations;
DROP POLICY IF EXISTS "Members can update conversation timestamp" ON public.conversations;

-- Temporarily disable and re-enable RLS to force cache clear
ALTER TABLE public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Recreate all policies fresh
CREATE POLICY "conversations_insert_policy" ON public.conversations 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "conversations_select_member" ON public.conversations 
  FOR SELECT TO authenticated 
  USING (is_conversation_member(auth.uid(), id));

CREATE POLICY "conversations_select_admin" ON public.conversations 
  FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "conversations_update_member" ON public.conversations 
  FOR UPDATE TO authenticated 
  USING (is_conversation_member(auth.uid(), id));

-- Also recreate conversation_members policies
DROP POLICY IF EXISTS "Conversation creator can add members" ON public.conversation_members;
DROP POLICY IF EXISTS "Users can view members of own conversations" ON public.conversation_members;
DROP POLICY IF EXISTS "Admins can view all conversation members" ON public.conversation_members;

ALTER TABLE public.conversation_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_members_insert" ON public.conversation_members 
  FOR INSERT TO authenticated 
  WITH CHECK (
    (EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_members.conversation_id AND created_by = auth.uid()))
    OR (auth.uid() = user_id)
  );

CREATE POLICY "conv_members_select_member" ON public.conversation_members 
  FOR SELECT TO authenticated 
  USING (is_conversation_member(auth.uid(), conversation_id));

CREATE POLICY "conv_members_select_admin" ON public.conversation_members 
  FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Messages too
DROP POLICY IF EXISTS "Users can send messages to own conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;

ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_insert" ON public.messages 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = sender_id AND is_conversation_member(auth.uid(), conversation_id));

CREATE POLICY "messages_select_member" ON public.messages 
  FOR SELECT TO authenticated 
  USING (is_conversation_member(auth.uid(), conversation_id));

CREATE POLICY "messages_select_admin" ON public.messages 
  FOR SELECT TO authenticated 
  USING (has_role(auth.uid(), 'admin'));

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
