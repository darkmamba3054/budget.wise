import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://hgevztkdrtajmqrmyguj.supabase.cO';
const SUPABASE_KEY = 'sb_publishable_XK0JbG74rVe62-sLMrIdUA_w0ZYfCFY';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);