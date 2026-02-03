"use client";

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';

export default function QrPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  if (!session) {
    return (
      <div className="text-center p-8">
        <p>Je moet ingelogd zijn om deze pagina te bekijken.</p>
        <Link href="/admin" className="text-primary hover:underline mt-4 inline-block">
          Terug naar login
        </Link>
      </div>
    );
  }

  const checkinUrl = `${baseUrl}/checkin`;
  const appUrl = baseUrl;

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <Link href="/admin" className="flex items-center text-slate-500 hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Terug naar Dashboard
        </Link>
        <button 
          onClick={() => window.print()} 
          className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          <Printer className="h-4 w-4 mr-2" />
          Printen
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12 print:block print:gap-8">
        {/* SHOP CHECK-IN QR */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center print:border-2 print:border-black print:shadow-none print:break-inside-avoid">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Check-in Scan</h2>
          <p className="text-slate-500 mb-6">Scan hier om direct een punt te krijgen!</p>
          
          <div className="flex justify-center mb-6">
            <QRCodeSVG value={checkinUrl} size={256} level="H" />
          </div>
          
          <div className="text-xs text-slate-400 font-mono">{checkinUrl}</div>
        </div>

        {/* GENERAL APP QR */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center print:border-2 print:border-black print:shadow-none print:break-inside-avoid print:mt-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Vat39 Loyalty App</h2>
          <p className="text-slate-500 mb-6">Ga naar de app en bekijk je spaarkaart.</p>
          
          <div className="flex justify-center mb-6">
            <QRCodeSVG value={appUrl} size={200} level="M" fgColor="#6B21A8" />
          </div>
          
          <div className="text-xs text-slate-400 font-mono">{appUrl}</div>
        </div>
      </div>
    </div>
  );
}
