import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suppression de compte — CheckAll@t',
  description: 'Comment supprimer votre compte CheckAll@t et vos données personnelles.',
};

// Rafraîchie toutes les heures : l'e-mail du support vient des paramètres de la plateforme
export const revalidate = 3600;

async function getSupportEmail(): Promise<string> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/settings/public`, { next: { revalidate: 3600 } });
    const data = await res.json();
    return data?.supportEmail || 'support@checkallat.com';
  } catch {
    return 'support@checkallat.com';
  }
}

/**
 * Page publique exigée par Google Play (et utile pour Apple) : comment supprimer son compte,
 * dans l'application ou sans elle, et quelles données sont supprimées ou conservées.
 */
export default async function AccountDeletionPage() {
  const email = await getSupportEmail();
  const mailto = `mailto:${email}?subject=${encodeURIComponent('Suppression de compte CheckAll@t / Account deletion')}`;

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
        {/* Français */}
        <section lang="fr" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-4 text-gray-700 text-sm leading-relaxed">
          <h1 className="text-2xl font-bold text-gray-900">Supprimer votre compte CheckAll@t</h1>
          <h2 className="text-base font-semibold text-gray-900">Depuis l&apos;application</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Ouvrez l&apos;application CheckAll@t et connectez-vous.</li>
            <li>Allez dans <strong>Profil</strong>, puis touchez <strong>Supprimer mon compte</strong>.</li>
            <li>Confirmez : la suppression est immédiate et définitive.</li>
          </ol>
          <h2 className="text-base font-semibold text-gray-900">Sans l&apos;application</h2>
          <p>
            Écrivez à <a href={mailto} className="text-primary underline">{email}</a> depuis l&apos;adresse e-mail ou en
            indiquant le numéro de téléphone de votre compte. Nous vérifions votre identité puis supprimons le compte
            sous 30 jours au plus, et vous le confirmons.
          </p>
          <h2 className="text-base font-semibold text-gray-900">Données supprimées et données conservées</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Supprimées :</strong> nom, téléphone, e-mail, photo, adresses enregistrées, pièces d&apos;identité et
              documents professionnels, cartes enregistrées, coordonnées de versement non utilisées, notifications.
            </li>
            <li>
              <strong>Conservées sous forme anonymisée :</strong> commandes, paiements et versements passés, pour nos
              obligations comptables et le traitement d&apos;éventuels litiges, pendant la durée légale applicable ; statistiques
              d&apos;usage de l&apos;application (si vous les aviez acceptées), détachées de votre compte et supprimées après 13 mois.
            </li>
            <li>
              La suppression n&apos;est possible qu&apos;en l&apos;absence de commande en cours, de versement en attente ou de
              solde impayé ; ils doivent être finalisés au préalable.
            </li>
          </ul>
          <p>
            Plus de détails : <a href="/privacy" className="text-primary underline">politique de confidentialité</a>.
          </p>
        </section>

        {/* English */}
        <section lang="en" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-4 text-gray-700 text-sm leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900">Delete your CheckAll@t account</h2>
          <h3 className="text-base font-semibold text-gray-900">In the app</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Open the CheckAll@t app and sign in.</li>
            <li>Go to <strong>Profile</strong>, then tap <strong>Delete my account</strong>.</li>
            <li>Confirm: deletion is immediate and permanent.</li>
          </ol>
          <h3 className="text-base font-semibold text-gray-900">Without the app</h3>
          <p>
            Email <a href={mailto} className="text-primary underline">{email}</a> from your account&apos;s email address, or
            include your account&apos;s phone number. We verify your identity, delete the account within 30 days at most and
            confirm it to you.
          </p>
          <h3 className="text-base font-semibold text-gray-900">Deleted and retained data</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Deleted:</strong> name, phone, email, photo, saved addresses, identity and professional documents,
              saved cards, unused payout details, notifications.
            </li>
            <li>
              <strong>Retained in anonymised form:</strong> past orders, payments and payouts, for our accounting
              obligations and possible disputes, for the applicable legal period; app usage statistics (if you had
              accepted them), detached from your account and deleted after 13 months.
            </li>
            <li>Deletion requires no ongoing order, pending payout or unpaid balance.</li>
          </ul>
        </section>

        {/* العربية */}
        <section lang="ar" dir="rtl" className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-4 text-gray-700 text-sm leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900">حذف حسابك في CheckAll@t</h2>
          <h3 className="text-base font-semibold text-gray-900">من التطبيق</h3>
          <ol className="list-decimal pr-5 space-y-1">
            <li>افتح تطبيق CheckAll@t وسجّل الدخول.</li>
            <li>اذهب إلى <strong>الملف الشخصي</strong> ثم اضغط على <strong>حذف حسابي</strong>.</li>
            <li>أكّد: الحذف فوري ونهائي.</li>
          </ol>
          <h3 className="text-base font-semibold text-gray-900">بدون التطبيق</h3>
          <p>
            راسلنا على <a href={mailto} className="text-primary underline">{email}</a> من البريد الإلكتروني المرتبط بحسابك أو
            مع ذكر رقم الهاتف المرتبط به. نتحقق من هويتك ثم نحذف الحساب خلال 30 يوماً كحد أقصى ونؤكد لك ذلك.
          </p>
          <h3 className="text-base font-semibold text-gray-900">البيانات المحذوفة والمحتفظ بها</h3>
          <ul className="list-disc pr-5 space-y-1">
            <li>
              <strong>تُحذف:</strong> الاسم، الهاتف، البريد الإلكتروني، الصورة، العناوين المحفوظة، وثائق الهوية والوثائق
              المهنية، البطاقات المحفوظة، بيانات التحويل غير المستخدمة، الإشعارات.
            </li>
            <li>
              <strong>يُحتفظ بها بشكل مجهول الهوية:</strong> الطلبات والمدفوعات والتحويلات السابقة، لالتزاماتنا المحاسبية
              ولمعالجة النزاعات المحتملة، خلال المدة القانونية المعمول بها؛ وإحصاءات استخدام التطبيق (إذا كنت قد وافقت عليها)
              بعد فصلها عن حسابك، وتُحذف بعد 13 شهراً.
            </li>
            <li>يشترط الحذف عدم وجود طلب جارٍ أو تحويل معلّق أو رصيد غير مدفوع.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
