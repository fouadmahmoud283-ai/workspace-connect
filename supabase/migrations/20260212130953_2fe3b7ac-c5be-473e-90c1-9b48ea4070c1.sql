
CREATE POLICY "Members can update conversation timestamp"
  ON public.conversations FOR UPDATE
  TO authenticated
  USING (public.is_conversation_member(auth.uid(), id))
  WITH CHECK (public.is_conversation_member(auth.uid(), id));
