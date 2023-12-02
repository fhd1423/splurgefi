import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://gmupexxqnzrrzozcovjp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMTQ2MjU5NCwiZXhwIjoyMDE3MDM4NTk0fQ.YFvIg4OtlNGRr-AmSGn0fCOmEJm1JxQmKl7GX_y5-wY',
);
