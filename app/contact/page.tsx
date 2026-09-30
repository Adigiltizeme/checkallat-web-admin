import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assistance — CheckAll@t',
  description: 'Contacter l’assistance CheckAll@t : questions, commandes, compte, prestataires.',
};

// Rafraîchie toutes les heures : e-mail et téléphone du support viennent des paramètres de la plateforme
export const revalidate = 3600;

async function getSupport(): Promise<{ email: string; phone: string | null }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/public`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return { email: data?.supportEmail || 'support@checkallat.com', phone: data?.supportPhone || null };
  } catch {
    return { email: 'support@checkallat.com', phone: null };
  }
}

/**
 * Page publique d'assistance (adresse « Support URL » demandée par l'App Store et Google Play).
 */
export default async function ContactPage() {
  const { email, phone } = await getSupport();
  const mailto = `mailto:${email}?subject=${encodeURIComponent('Assistance CheckAll@t / Support')}`;
  const section = 'bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-4 text-gray-700 text-sm leading-relaxed';
  const link = 'text-primary underline';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CheckAll@t</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <section lang="fr" className={section}>
          <h1 className="text-2xl font-bold text-gray-900">Assistance CheckAll@t</h1>
          <p>
            Une question sur une commande, un paiement, votre compte ou votre activité de prestataire ? Le plus rapide :
            dans l&apos;application, ouvrez <strong>Profil → Aide &amp; Support</strong> ; votre message nous arrive avec les
            informations de votre compte.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>E-mail : <a href={mailto} className={link}>{email}</a></li>
            {phone && <li>Téléphone : {phone}</li>}
            <li>Problème sur une commande en cours : ouvrez un litige depuis la commande concernée.</li>
          </ul>
          <p>
            Documents : <a href="/terms" className={link}>conditions générales</a> ·{' '}
            <a href="/privacy" className={link}>politique de confidentialité</a> ·{' '}
            <a href="/account-deletion" className={link}>suppression de compte</a>
          </p>
        </section>

        <section lang="en" className={section}>
          <h2 className="text-2xl font-bold text-gray-900">CheckAll@t support</h2>
          <p>
            A question about an order, a payment, your account or your work as a professional? The fastest way: in the
            app, open <strong>Profile → Help &amp; Support</strong>; your message reaches us with your account details.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Email: <a href={mailto} className={link}>{email}</a></li>
            {phone && <li>Phone: {phone}</li>}
            <li>Problem with an ongoing order: open a dispute from that order.</li>
          </ul>
          <p>
            <a href="/terms" className={link}>Terms of use</a> · <a href="/privacy" className={link}>Privacy policy</a> ·{' '}
            <a href="/account-deletion" className={link}>Account deletion</a>
          </p>
        </section>

        <section lang="ar" dir="rtl" className={section}>
          <h2 className="text-2xl font-bold text-gray-900">الدعم في CheckAll@t</h2>
          <p>
            لديك سؤال عن طلب أو دفع أو حسابك أو نشاطك كمحترف؟ الطريقة الأسرع: في التطبيق، افتح{' '}
            <strong>الملف الشخصي ← المساعدة والدعم</strong>، وستصلنا رسالتك مع معلومات حسابك.
          </p>
          <ul className="list-disc pr-5 space-y-1">
            <li>البريد الإلكتروني: <a href={mailto} className={link}>{email}</a></li>
            {phone && <li>الهاتف: <span dir="ltr">{phone}</span></li>}
            <li>مشكلة في طلب جارٍ: افتح نزاعاً من الطلب المعني.</li>
          </ul>
          <p>
            <a href="/terms" className={link}>الشروط العامة</a> · <a href="/privacy" className={link}>سياسة الخصوصية</a> ·{' '}
            <a href="/account-deletion" className={link}>حذف الحساب</a>
          </p>
        </section>
      </main>
    </div>
  );
}
