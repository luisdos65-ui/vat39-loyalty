"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, LogOut, CheckCircle, Search, QrCode } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary">--</div>
          <div className="text-xs text-slate-500">Checkins Vandaag</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-primary">--</div>
          <div className="text-xs text-slate-500">Actieve Vouchers</div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Ingelogd als {session.user.email}
      </div>
    </div>
  );
}
