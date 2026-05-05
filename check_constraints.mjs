import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xncciaozzxoqbesfxpww.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuY2NpYW96enhvcWJlc2Z4cHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM0ODIzNCwiZXhwIjoyMDg3OTI0MjM0fQ.MQRcV40PTwXPml9PqEeb9oLu6bwdkd5lI-IAhkfRDr8'
)

const { data, error } = await supabase.rpc('pg_get_constraintdef', {})
console.log('rpc result:', data, error)

// Alternative: try raw SQL via management API
const res = await fetch('https://xncciaozzxoqbesfxpww.supabase.co/pg', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuY2NpYW96enhvcWJlc2Z4cHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM0ODIzNCwiZXhwIjoyMDg3OTI0MjM0fQ.MQRcV40PTwXPml9PqEeb9oLu6bwdkd5lI-IAhkfRDr8',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuY2NpYW96enhvcWJlc2Z4cHd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM0ODIzNCwiZXhwIjoyMDg3OTI0MjM0fQ.MQRcV40PTwXPml9PqEeb9oLu6bwdkd5lI-IAhkfRDr8',
  },
  body: JSON.stringify({
    query: "SELECT conname, pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conrelid = 'public.invitations'::regclass AND contype = 'c';"
  })
})
const text = await res.text()
console.log('pg result:', res.status, text.substring(0, 500))
