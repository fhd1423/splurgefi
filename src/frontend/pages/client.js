import { createClient } from '@supabase/supabase-js'
import { create } from 'domain'


export const supabase = createClient(

    "https://gmupexxqnzrrzozcovjp.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdXBleHhxbnpycnpvemNvdmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyMTkxMjcsImV4cCI6MjAxNDc5NTEyN30.xetdfXSWa5-VMERkCTAnLEhrD2sb1anc3hast3jij_g"

)