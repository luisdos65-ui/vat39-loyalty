const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jbpgrcocgtycnlufxmac.supabase.co';
// Service Role Key
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicGdyY29jZ3R5Y25sdWZ4bWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMzMzMiwiZXhwIjoyMDg1Njk5MzMyfQ.wK1I_c2i60wEdhPghZRwpVbLmIsGE0Dk2XGGZLf8Kig';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('🔍 Checking Supabase Auth Users...');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error fetching users:', error.message);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️ Geen gebruikers gevonden in Supabase Auth!');
    return;
  }

  console.log(`✅ ${users.length} gebruikers gevonden:`);
  users.forEach(u => {
    console.log(`- Email: ${u.email} | ID: ${u.id} | Confirmed: ${u.email_confirmed_at ? 'Yes' : 'No'}`);
  });

  console.log('\n🔍 Checking Admins Table...');
  const { data: admins, error: adminError } = await supabase
    .from('admins')
    .select('*');

  if (adminError) {
    console.error('❌ Error fetching admins table:', adminError.message);
  } else {
    console.log(`✅ ${admins.length} admins gevonden in database:`);
    admins.forEach(a => {
      console.log(`- Email: ${a.email} | Name: ${a.name}`);
    });
  }
}

run();
