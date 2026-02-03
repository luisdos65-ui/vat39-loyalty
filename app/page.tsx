import Link from "next/link";
import { QrCode, CreditCard } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Vat39 Loyalty</h1>
        <p className="text-slate-600 text-lg">
          Spaar voor korting bij elk bezoek aan De Specialist.
        </p>
      </div>

      <div className="p-6 bg-purple-50 rounded-2xl w-full max-w-sm border-2 border-purple-100">
        <div className="flex flex-col items-center space-y-4">
          <QrCode size={64} className="text-primary" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">Hoe werkt het?</h2>
            <ol className="text-left mt-4 space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Scan de QR code in de winkel</li>
              <li>Ontvang direct een punt</li>
              <li>Bij 5 punten krijg je 5% korting!</li>
            </ol>
          </div>
        </div>
      </div>

      <Link 
        href="/card"
        className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-lg"
      >
        <CreditCard />
        <span>Bekijk mijn Spaarkaart</span>
      </Link>

      <div className="text-xs text-slate-400 text-center px-4">
        <p>Je spaarkaart is gekoppeld aan dit apparaat.</p>
        <Link href="/privacy" className="underline hover:text-slate-600">Privacy & Voorwaarden</Link>
      </div>
    </div>
  );
}
