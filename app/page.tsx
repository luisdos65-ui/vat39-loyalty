import Link from "next/link";
import { QrCode, Gift, PartyPopper, ChevronRight, Smartphone, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-white pt-12 pb-8 px-6 text-center">
        <h1 className="text-4xl font-extrabold text-primary mb-4 tracking-tight">
          Welkom bij <span className="text-slate-800">Vat39 Loyalty</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
          Het slimme spaarsysteem voor De Specialist. Geen pasjes, geen gedoe. Alleen maar voordeel.
        </p>
      </section>

      {/* Main Action Card */}
      <section className="px-6 -mt-4 mb-12 relative z-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 max-w-md mx-auto">
          <Link 
            href="/card"
            className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-between transition-all transform hover:scale-[1.02] shadow-md group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg">Mijn Spaarkaart</span>
            </div>
            <ChevronRight className="h-5 w-5 text-purple-200 group-hover:text-white transition-colors" />
          </Link>
          <p className="text-xs text-slate-400 text-center mt-3">
            <ShieldCheck className="inline h-3 w-3 mr-1" />
            Je kaart is veilig gekoppeld aan dit apparaat
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="px-6 pb-12 max-w-lg mx-auto w-full space-y-8">
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">
          Zo werkt het
        </h2>

        {/* Step 1 */}
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
            <QrCode className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">1. Scan bij de kassa</h3>
            <p className="text-slate-600 leading-relaxed">
              Scan de QR-code op de balie bij elk bezoek. Je telefoon is je spaarkaart.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start space-x-4">
          <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
            <Gift className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">2. Spaar punten</h3>
            <p className="text-slate-600 leading-relaxed">
              Ontvang direct 1 punt per bezoek. Je ziet je saldo meteen in deze app.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start space-x-4">
          <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
            <PartyPopper className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">3. Pak je voordeel</h3>
            <p className="text-slate-600 leading-relaxed">
              Volle kaart? Dan krijg je direct <strong>5% korting</strong> op je aankoop!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-slate-400 text-sm bg-slate-50 border-t border-slate-100">
        <p>&copy; {new Date().getFullYear()} Vat39 Loyalty</p>
        <div className="mt-4 space-x-4">
          <Link href="/admin" className="hover:text-primary transition-colors">Admin Login</Link>
          <span className="text-slate-300">|</span>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
