const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jbpgrcocgtycnlufxmac.supabase.co';
// Service Role Key (Server-side only!)
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicGdyY29jZ3R5Y25sdWZ4bWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMzMzMiwiZXhwIjoyMDg1Njk5MzMyfQ.wK1I_c2i60wEdhPghZRwpVbLmIsGE0Dk2XGGZLf8Kig';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const email = process.argv[2];
if (!email) {
  console.error('❌ Gebruik: node create_admin.js <jouw-email>');
  process.exit(1);
}

async function run() {
  console.log(`🔍 Zoeken naar gebruiker: ${email}...`);
  
  // 1. Find Auth User
  // Note: listUsers defaults to page 1, 50 users. Should be enough for now.
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('❌ Fout bij ophalen gebruikers:', listError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    console.error(`❌ Geen gebruiker gevonden met email "${email}".`);
    console.error('👉 Tip: Maak eerst een gebruiker aan in Supabase Authentication -> Users -> Add User');
    process.exit(1);
  }

  console.log(`✅ Gebruiker gevonden! ID: ${user.id}`);

  // 2. Check if already admin
  const { data: existingAdmin } = await supabase
    .from('admins')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (existingAdmin) {
    console.log('ℹ️ Je bent al een admin!');
    return;
  }

  // 3. Insert into admins
  const { error: insertError } = await supabase
    .from('admins')
    .insert([
      { 
        auth_user_id: user.id, 
        email: user.email, 
        name: 'Admin',
        role: 'admin' 
      }
    ]);

  if (insertError) {
    console.error('❌ Fout bij toevoegen aan admins tabel:', insertError.message);
  } else {
    console.log('🎉 Succes! Je bent nu admin.');
    console.log('👉 Je kunt nu inloggen op /admin');
  }
}

run();
