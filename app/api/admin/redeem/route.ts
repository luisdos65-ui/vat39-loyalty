import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Create a local supabase client that verifies the JWT
const getAuthSupabase = (token: string) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getAuthSupabase(token);

    // Verify User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse Body
    const { voucher_code } = await req.json();
    if (!voucher_code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 });
    }

    // Use Service Role to update (since Admin might not have direct write policy if we rely on API, 
    // but here we are authenticated as Admin so we COULD use RLS. 
    // However, let's use Service Role to be safe and consistent with "Server API" approach)
    // Actually, if RLS policies allow "Authenticated" to write, we don't need Service Role.
    // The migration said: "Admins can do everything ... for all to authenticated".
    // So `supabase` (authenticated) is enough.
    
    // Check Voucher
    const { data: voucher, error: fetchError } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', voucher_code)
      .single();

    if (fetchError || !voucher) {
      return NextResponse.json({ error: 'Voucher niet gevonden' }, { status: 404 });
    }

    if (!voucher.is_active) {
      return NextResponse.json({ error: 'Voucher is al gebruikt of inactief' }, { status: 400 });
    }

    // Redeem
    const { error: updateError } = await supabase
      .from('vouchers')
      .update({ 
        is_active: false,
        redeemed_at: new Date().toISOString()
      })
      .eq('code', voucher_code);

    if (updateError) {
      return NextResponse.json({ error: 'Fout bij inwisselen' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Voucher succesvol ingewisseld!' });

  } catch (error) {
    console.error('Redeem Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
