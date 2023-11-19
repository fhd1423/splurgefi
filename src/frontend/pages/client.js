import { createClient } from '@supabase/supabase-js'


export const supabase = createClient(
    "https://gmupexxqnzrrzozcovjp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTIxOTEyNywiZXhwIjoyMDE0Nzk1MTI3fQ.iF0xiz-vE5tx52u4soGJbEtGHtIB_EyQFFU_eB5dVak" 
)