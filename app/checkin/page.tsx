"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDevice } from "@/lib/hooks/useDevice";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function CheckinPage() {
  const deviceId = useDevice();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Je check-in wordt verwerkt...');

  useEffect(() => {
    if (!deviceId) return;

    const performCheckin = async () => {
      try {
        const res = await fetch('/api/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_id: deviceId })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Check-in geslaagd!');
          // Redirect after short delay
          setTimeout(() => router.push('/card'), 2000);
        } else {
          setStatus('error');
          setMessage(data.message || data.error || 'Er ging iets mis.');
          // Redirect after delay even on error (so they can see their card)
          setTimeout(() => router.push('/card'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Netwerkfout. Probeer het opnieuw.');
      }
    };

    performCheckin();
  }, [deviceId, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Even geduld...</h2>
          <p className="text-slate-500">{message}</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-green-600">Gelukt!</h2>
          <p className="text-slate-600 mt-2">{message}</p>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-red-600">Oeps!</h2>
          <p className="text-slate-600 mt-2">{message}</p>
        </>
      )}
    </div>
  );
}
