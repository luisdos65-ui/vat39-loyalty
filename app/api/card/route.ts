import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const VISITS_REQUIRED = 5;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const device_id = searchParams.get('device_id');

    if (!device_id) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Get last redemption
    const { data: lastRedemption } = await supabase
      .from('vouchers')
      .select('redeemed_at')
      .eq('device_id', device_id)
      .not('redeemed_at', 'is', null)
      .order('redeemed_at', { ascending: false })
      .limit(1)
      .single();

    const cutoffDate = lastRedemption ? lastRedemption.redeemed_at : '1970-01-01';

    // Count checkins
    const { count } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', device_id)
      .gt('created_at', cutoffDate);

    // Get active voucher
    const { data: activeVoucher } = await supabase
      .from('vouchers')
      .select('*')
      .eq('device_id', device_id)
      .eq('is_active', true)
      .single();

    // Get device info (name, email)
    const { data: device } = await supabase
      .from('devices')
      .select('name, email')
      .eq('device_id', device_id)
      .single();

    return NextResponse.json({
      device,
      checkin_count: count || 0,
      visits_required: VISITS_REQUIRED,
      reward_available: !!activeVoucher,
      active_voucher: activeVoucher
    });

  } catch (error) {
    console.error('Card API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
