// supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kudrcbeumfjabokkpqlb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1ZHJjYmV1bWZqYWJva2twcWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzNzM0MTEsImV4cCI6MjA4NTk0OTQxMX0.XWfuvHlVFuH5Q_zzfk5RNAYvkz5h5nwFJEdLg-BtP_c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
