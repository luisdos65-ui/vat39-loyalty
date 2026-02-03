# Vat39 Loyalty Web (PWA)

Dit is de mobiele webapp voor Vat39 De Specialist loyaliteitsprogramma (No-Registration Mode).

## Setup Instructies

1. **Installeer dependencies**
   Open een terminal in deze map (`vat39-loyalty-web`) en run:
   ```bash
   npm install
   ```

2. **Database Setup (Supabase)**
   - Ga naar je Supabase Dashboard -> SQL Editor.
   - Kopieer de inhoud van `supabase_migrations.sql`.
   - Run de query om de tabellen en policies aan te maken.

3. **Environment Variables**
   - Pas `.env.local` aan.
   - Voeg je `SUPABASE_SERVICE_ROLE_KEY` toe (vind deze in Supabase Dashboard -> Project Settings -> API).

4. **Start de App**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Admin
Ga naar `/admin` om in te loggen en vouchers in te wisselen.
Zorg dat je een user hebt aangemaakt in Supabase Auth met een email/wachtwoord.

## Deployment (Vercel)
1. Push naar GitHub.
2. Importeer project in Vercel.
3. Voeg Environment Variables toe in Vercel.
4. Deploy!
