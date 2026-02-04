"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, LogOut, CheckCircle, Search, QrCode, Users, Calendar, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<any>(null);

  const [stats, setStats] = useState({
    totalDevices: 0,
    checkinsToday: 0,
    activeVouchers: 0,
    recentDevices: [] as any[]
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchStats();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchStats();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Totaal aantal unieke apparaten (klanten)
      const { count: deviceCount } = await supabase
        .from('devices')
        .select('*', { count: 'exact', head: true });

      // 2. Checkins vandaag
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: checkinsCount } = await supabase
        .from('checkins')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // 3. Actieve vouchers
      const { count: voucherCount } = await supabase
        .from('vouchers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .is('redeemed_at', null);

      // 4. Recente klanten ophalen
      const { data: devices } = await supabase
        .from('devices')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(10);

      // Extra: Checkin counts per device ophalen (simpele implementatie)
      const devicesWithCounts = await Promise.all((devices || []).map(async (dev) => {
        const { count } = await supabase
          .from('checkins')
          .select('*', { count: 'exact', head: true })
          .eq('device_id', dev.device_id);
        return { ...dev, checkins_count: count };
      }));

      setStats({
        totalDevices: deviceCount || 0,
        checkinsToday: checkinsCount || 0,
        activeVouchers: voucherCount || 0,
        recentDevices: devicesWithCounts || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigateToQr = () => {
    router.push('/admin/qr');
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setRedeemStatus({ loading: true });

    try {
      const res = await fetch('/api/admin/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ voucher_code: voucherCode })
      });
      const data = await res.json();
      setRedeemStatus({ success: res.ok, message: data.message || data.error });
      if (res.ok) setVoucherCode('');
    } catch (err) {
      setRedeemStatus({ success: false, message: 'Netwerkfout' });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {loading ? 'Laden...' : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <button
            onClick={navigateToQr}
            className="p-2 text-primary hover:bg-purple-50 rounded-lg"
            title="QR Codes Printen"
          >
            <QrCode className="h-5 w-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            title="Uitloggen"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Redeem Section */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="text-green-500" size={20} />
          Voucher Inwisselen
        </h2>
        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Voucher Code (bijv. X7Y2Z9)"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="w-full p-3 border border-slate-300 rounded-lg font-mono text-center text-lg uppercase tracking-widest"
            />
          </div>
          <button
            type="submit"
            disabled={redeemStatus?.loading || !voucherCode}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {redeemStatus?.loading ? 'Verwerken...' : 'Inwisselen'}
          </button>
          
          {redeemStatus && (
            <div className={`p-3 rounded-lg text-center text-sm font-medium ${redeemStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {redeemStatus.message}
            </div>
          )}
        </form>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
          <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-700">{stats.totalDevices}</div>
          <div className="text-xs text-slate-500">Totaal Klanten</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
          <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-700">{stats.checkinsToday}</div>
          <div className="text-xs text-slate-500">Checkins Vandaag</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100 col-span-2">
          <Ticket className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-700">{stats.activeVouchers}</div>
          <div className="text-xs text-slate-500">Openstaande Vouchers</div>
        </div>
      </div>

      {/* Recent Customers List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Recente Klanten</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentDevices.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">Nog geen klanten gezien.</div>
          ) : (
            stats.recentDevices.map((dev) => (
              <div key={dev.device_id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-700">
                    Klant ...{dev.device_id.slice(0, 8)}
                  </div>
                  <div className="text-xs text-slate-400">
                    Laatst gezien: {new Date(dev.last_seen_at).toLocaleDateString()} {new Date(dev.last_seen_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
                <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                  {dev.checkins_count} checkins
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Ingelogd als {session.user.email}
      </div>
    </div>
  );
}
