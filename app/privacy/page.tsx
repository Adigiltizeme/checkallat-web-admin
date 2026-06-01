export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-gray-900">CheckAll@t</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : mai 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Qui sommes-nous ?</h2>
            <p>
              CheckAll@t est une plateforme de mise en relation entre utilisateurs, prestataires, vendeurs et partenaires dans différents domaines de services et de produits. La plateforme est éditée et exploitée par Digiltizème, qui agit en qualité de responsable du traitement des données personnelles collectées dans le cadre de l’utilisation du service.
            </p>
            <p className="mt-2">
              Pour toute question relative à la protection des données, vous pouvez nous contacter à l’adresse : <strong>privacy@checkallat.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Données collectées</h2>
            <p className="mb-2">
              Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme, à la sécurité des utilisateurs et à la conformité légale, notamment :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Données d’identité :</strong> prénom, nom, adresse e-mail, numéro de téléphone, photo de profil.</li>
              <li><strong>Données de compte :</strong> identifiants, préférences, langue, rôle utilisateur, paramètres du compte.</li>
              <li><strong>Données de localisation :</strong> position GPS lorsque cela est nécessaire au service et avec consentement lorsque la loi l’exige.</li>
              <li><strong>Données de transaction :</strong> commandes, réservations, paiements, remboursements, commissions, historique des opérations.</li>
              <li><strong>Données professionnelles :</strong> informations liées au véhicule, à l’activité, aux documents justificatifs et à la validation du profil.</li>
              <li><strong>Données de communication :</strong> messages échangés via la messagerie intégrée, support et avis.</li>
              <li><strong>Données techniques :</strong> adresse IP, appareil utilisé, système d’exploitation, journaux, identifiants techniques, rapports d’erreurs.</li>
              <li><strong>Données de contenu :</strong> photos, documents et autres fichiers transmis volontairement dans le cadre du service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Finalités du traitement</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Créer et gérer votre compte utilisateur.</li>
              <li>Permettre la mise en relation entre utilisateurs et prestataires, vendeurs ou partenaires.</li>
              <li>Traiter les paiements, remboursements, commissions et reversements.</li>
              <li>Assurer le bon fonctionnement des modules proposés par CheckAll@t.</li>
              <li>Afficher certaines informations de géolocalisation lorsque cela est nécessaire au service.</li>
              <li>Vous envoyer des notifications liées à vos réservations, messages ou activités sur la plateforme.</li>
              <li>Prévenir la fraude, sécuriser la plateforme et détecter les usages abusifs.</li>
              <li>Améliorer nos services grâce à des analyses statistiques agrégées et anonymisées.</li>
              <li>Répondre à nos obligations légales, comptables, fiscales et réglementaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Base légale du traitement</h2>
            <p className="mb-2">
              Selon les cas, vos données peuvent être traitées sur la base :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De l’exécution d’un contrat ou de mesures précontractuelles.</li>
              <li>De votre consentement, notamment pour certaines fonctionnalités optionnelles.</li>
              <li>Du respect d’obligations légales.</li>
              <li>De l’intérêt légitime de CheckAll@t, par exemple pour la sécurité, la prévention de la fraude ou l’amélioration du service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Partage avec des tiers</h2>
            <p className="mb-2">
              Nous pouvons faire appel à des prestataires techniques et partenaires de confiance pour faire fonctionner la plateforme. Ils n’utilisent vos données que dans le cadre des missions qui leur sont confiées.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> — traitement des paiements.</li>
              <li><strong>Twilio</strong> — envoi de SMS, OTP et notifications de vérification.</li>
              <li><strong>Mapbox</strong> — cartographie, géocodage et calcul d’itinéraires.</li>
              <li><strong>Cloudinary</strong> — stockage et optimisation d’images et de fichiers.</li>
              <li><strong>Sentry</strong> — surveillance des erreurs techniques et amélioration de la stabilité.</li>
              <li><strong>Firebase / Google</strong> — notifications push et fonctionnalités techniques associées.</li>
            </ul>
            <p className="mt-2">
              Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Transferts hors de votre pays</h2>
            <p>
              Certains prestataires techniques peuvent être situés dans d’autres pays. Lorsque cela est nécessaire, nous prenons des mesures appropriées pour encadrer ces transferts et protéger vos données conformément à la réglementation applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Conservation des données</h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire à la fourniture du service, puis archivées ou supprimées selon les obligations légales applicables. Les durées de conservation peuvent varier selon la nature des données : compte utilisateur, données de transaction, contenus échangés, documents de vérification, journaux techniques ou obligations comptables.
            </p>
            <p className="mt-2">
              Lorsqu’un compte est supprimé, certaines données peuvent être conservées temporairement afin de répondre à des obligations légales, fiscales, comptables, de sécurité ou de résolution de litiges.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Vos droits</h2>
            <p className="mb-2">
              Conformément à la réglementation applicable, vous disposez notamment des droits suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Droit d’accès à vos données.</li>
              <li>Droit de rectification des données inexactes ou incomplètes.</li>
              <li>Droit à l’effacement, dans les limites légales applicables.</li>
              <li>Droit d’opposition à certains traitements.</li>
              <li>Droit à la limitation du traitement.</li>
              <li>Droit à la portabilité, lorsque cela est applicable.</li>
              <li>Droit de retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.</li>
              <li>Droit d’introduire une réclamation auprès de l’autorité compétente.</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@checkallat.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre la perte, la modification, l’accès non autorisé ou la divulgation. Les échanges avec nos serveurs sont protégés par chiffrement, et les mots de passe sont stockés sous forme hachée de manière sécurisée.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Cookies et technologies similaires</h2>
            <p>
              L’application mobile n’utilise pas de cookies au sens classique du terme. Si un site web ou un panneau d’administration utilise des cookies ou traceurs, seuls les cookies strictement nécessaires au fonctionnement du service sont activés par défaut, sauf consentement supplémentaire requis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Modifications de la politique</h2>
            <p>
              Nous pouvons modifier cette politique afin de refléter des évolutions légales, techniques ou fonctionnelles. En cas de changement important, une notification peut être affichée dans l’application ou envoyée par e-mail lorsque cela est approprié.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données personnelles :<br />
              <strong>Email confidentialité :</strong> privacy@checkallat.com<br />
              <strong>Email support :</strong> support@checkallat.com
            </p>
          </section>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        © 2026 CheckAll@t by <a href="https://digiltizeme-portfolio.vercel.app" className="underline hover:text-gray-600">Digiltizème</a>. Tous droits réservés. —{' '}
        <a href="https://checkallat-web-admin.vercel.app/terms" className="underline hover:text-gray-600">Conditions d'utilisation</a>
      </footer>
    </div>
  );
}