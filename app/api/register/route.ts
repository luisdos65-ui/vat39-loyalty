import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { device_id, name, email } = await req.json();

    if (!device_id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Upsert the device info (creates if not exists, updates if exists)
    const { error: upsertError } = await supabase
      .from('devices')
      .upsert({ device_id, name, email }, { onConflict: 'device_id' });
      
    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
