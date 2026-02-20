
-- Grant permissions to authenticated and anon roles on conversation tables
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT SELECT ON public.conversations TO anon;

GRANT SELECT, INSERT ON public.conversation_members TO authenticated;
GRANT SELECT ON public.conversation_members TO anon;

GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT SELECT ON public.messages TO anon;

-- Restore proper insert policy (remove the overly permissive one)
DROP POLICY IF EXISTS "conversations_insert_policy" ON public.conversations;
CREATE POLICY "conversations_insert_policy" ON public.conversations 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = created_by);

NOTIFY pgrst, 'reload schema';
