
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xdvxgadvsyrdlzfbhffq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkdnhnYWR2c3lyZGx6ZmJoZmZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0ODA4MDcsImV4cCI6MjA4MjA1NjgwN30.LrVhvHTR9kXV04j38IAH-n_81n2M5RYVHA-bel0ZURc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
