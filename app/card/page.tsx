"use client";

import { useEffect, useState } from "react";
import { useDevice } from "@/lib/hooks/useDevice";
import { Loader2, Gift, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function CardPage() {
  const deviceId = useDevice();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/card?device_id=${deviceId}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return <div className="text-center p-8">Kan gegevens niet laden.</div>;

  const percentage = Math.min(100, (data.checkin_count / data.visits_required) * 100);

  return (
    <div className="space-y-8 w-full">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800">Mijn Spaarkaart</h1>
        <p className="text-slate-500 text-sm mt-1">ID: {deviceId?.substring(0, 8)}...</p>
      </div>

      {/* Voucher Card */}
      {data.reward_available ? (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-white/20 h-24 w-24 rounded-full blur-xl"></div>
          <div className="relative z-10 text-center space-y-4">
            <div className="flex justify-center">
              <Gift className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">5% KORTING!</h2>
              <p className="text-yellow-100">Laat deze code zien aan de kassa</p>
            </div>
            <div className="bg-white text-slate-900 py-3 px-6 rounded-lg font-mono text-2xl font-bold tracking-widest">
              {data.active_voucher?.code}
            </div>
            <div className="text-xs text-yellow-100 opacity-75">
              Geldig tot inwisseling
            </div>
          </div>
        </div>
      ) : (
        /* Progress Card */
        <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-700">Spaarpunten</h2>
              <p className="text-sm text-slate-500">Nog {data.visits_required - data.checkin_count} bezoeken voor korting</p>
            </div>
            <div className="text-3xl font-bold text-primary">
              {data.checkin_count}/{data.visits_required}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          {/* Stamps Visual */}
          <div className="flex justify-between mt-6 px-2">
            {[...Array(data.visits_required)].map((_, i) => (
              <div 
                key={i}
                className={`h-10 w-10 rounded-full flex items-center justify-center border-2 
                  ${i < data.checkin_count 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white border-slate-200 text-slate-300'
                  }`}
              >
                {i < data.checkin_count ? <QrCode size={20} /> : (i + 1)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Info */}
      <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 space-y-2">
        <p>• 1 check-in per dag mogelijk.</p>
        <p>• Spaarkaart is gekoppeld aan dit apparaat.</p>
        <p>• Wis je cookies niet, anders ben je je punten kwijt.</p>
      </div>
    </div>
  );
}
