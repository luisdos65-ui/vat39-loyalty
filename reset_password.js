const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jbpgrcocgtycnlufxmac.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpicGdyY29jZ3R5Y25sdWZ4bWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyMzMzMiwiZXhwIjoyMDg1Njk5MzMyfQ.wK1I_c2i60wEdhPghZRwpVbLmIsGE0Dk2XGGZLf8Kig';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const email = 'luisdos65@gmail.com';
const newPassword = 'Vat39Admin!';

async function run() {
  console.log(`🔄 Wachtwoord resetten voor ${email}...`);
  
  // 1. Get User ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.error('❌ Gebruiker niet gevonden.');
    return;
  }

  // 2. Update Password
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ Fout bij resetten:', error.message);
  } else {
    console.log('✅ Wachtwoord succesvol gewijzigd!');
    console.log(`📧 Email: ${email}`);
    console.log(`Mwachtwoord: ${newPassword}`);
  }
}

run();
