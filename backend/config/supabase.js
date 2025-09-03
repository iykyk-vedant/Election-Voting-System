const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://iqslfcsssazhwzptusve.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxc2xmY3Nzc2F6aHd6cHR1c3ZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NTUwNjcsImV4cCI6MjA3MjIzMTA2N30.fDyWzQ-j-bCVzVSrTxiEZoBMekB6HmCwglsLvDpGa44";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase;