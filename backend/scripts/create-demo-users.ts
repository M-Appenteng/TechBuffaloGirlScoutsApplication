import 'dotenv/config';
import { adminClient } from '../src/lib/supabase.js';

const DEMO_PASSWORD = 'Volunteer2026!';

const accounts = [
  { email: 'jamie.volunteer@example.com', label: 'volunteer' },
  { email: 'kiara.staff@example.com', label: 'staff/event leader' },
];

for (const account of accounts) {
  const { error } = await adminClient.auth.admin.createUser({
    email: account.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });

  if (error && !error.message.includes('already been registered')) {
    console.error(`Failed to create ${account.label} (${account.email}):`, error.message);
    continue;
  }

  console.log(`${error ? 'Already exists' : 'Created'}: ${account.label} — ${account.email}`);
}

console.log(`\nPassword for both accounts: ${DEMO_PASSWORD}`);
