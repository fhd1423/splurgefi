import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE0NjI1OTQsImV4cCI6MjAxNzAzODU5NH0.rBzk_etmt7NYB2Pzvn5TwAKvZhFjMRS-JPcP_2JtMeI',
);
