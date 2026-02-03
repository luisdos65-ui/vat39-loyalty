import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const VISITS_REQUIRED = 5;
const COOLDOWN_HOURS = 12;

export async function POST(req: NextRequest) {
  try {
    const { device_id, user_agent } = await req.json();

    if (!device_id) {
      return NextResponse.json({ error: 'Device ID required' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // 1. Get or Create Device
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', device_id)
      .single();

    if (deviceError && deviceError.code !== 'PGRST116') { // PGRST116 is 'not found'
      console.error('Device fetch error:', deviceError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!device) {
      const { error: insertError } = await supabase
        .from('devices')
        .insert({
          device_id,
          user_agent: user_agent || req.headers.get('user-agent'),
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });
      
      if (insertError) {
        return NextResponse.json({ error: 'Failed to register device' }, { status: 500 });
      }
    } else {
      if (device.banned) {
        return NextResponse.json({ error: 'Device banned' }, { status: 403 });
      }
      // Update last seen
      await supabase.from('devices').update({ 
        last_seen_at: new Date().toISOString(),
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      }).eq('device_id', device_id);
    }

    // 2. Check Cooldown (Last Checkin)
    const { data: lastCheckin } = await supabase
      .from('checkins')
      .select('created_at')
      .eq('device_id', device_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastCheckin) {
      const lastDate = new Date(lastCheckin.created_at);
      const now = new Date();
      const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < COOLDOWN_HOURS) {
        return NextResponse.json({ 
          success: false, 
          message: `Je hebt recent al ingecheckt. Probeer het over ${Math.ceil(COOLDOWN_HOURS - diffHours)} uur nog eens.` 
        }, { status: 429 });
      }
    }

    // 3. Record Checkin
    const { error: checkinError } = await supabase
      .from('checkins')
      .insert({ device_id });

    if (checkinError) {
      return NextResponse.json({ error: 'Failed to record checkin' }, { status: 500 });
    }

    // 4. Calculate Stats & Voucher
    // Get last redemption time to count visits since then
    const { data: lastRedemption } = await supabase
      .from('vouchers')
      .select('redeemed_at')
      .eq('device_id', device_id)
      .not('redeemed_at', 'is', null)
      .order('redeemed_at', { ascending: false })
      .limit(1)
      .single();

    const cutoffDate = lastRedemption ? lastRedemption.redeemed_at : '1970-01-01';

    const { count } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('device_id', device_id)
      .gt('created_at', cutoffDate);
    
    const currentCount = count || 0;

    // Check if active voucher exists
    const { data: activeVoucher } = await supabase
      .from('vouchers')
      .select('*')
      .eq('device_id', device_id)
      .eq('is_active', true)
      .single();

    let newVoucher = null;

    if (currentCount >= VISITS_REQUIRED && !activeVoucher) {
      // Create Voucher
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { data: voucher, error: voucherError } = await supabase
        .from('vouchers')
        .insert({
          code,
          device_id,
          discount_percent: 5,
          is_active: true
        })
        .select()
        .single();
      
      if (!voucherError) {
        newVoucher = voucher;
      }
    }

    return NextResponse.json({
      success: true,
      checkin_count: currentCount,
      visits_required: VISITS_REQUIRED,
      reward_available: !!(activeVoucher || newVoucher),
      active_voucher: activeVoucher || newVoucher,
      message: 'Check-in geslaagd!'
    });

  } catch (error) {
    console.error('Checkin API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
