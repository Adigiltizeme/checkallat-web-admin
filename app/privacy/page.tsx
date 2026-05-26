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
              CheckAll@t est une plateforme de mise en relation entre particuliers et professionnels dans les domaines du transport de déménagement, des services à domicile et de la vente de produits. La plateforme est éditée et exploitée par la société Digiltizème, dont le responsable du traitement des données est joignable à l'adresse : <strong>support@checkallat.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Données collectées</h2>
            <p className="mb-2">Nous collectons les données suivantes lors de votre utilisation de l'application :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Données d'identité :</strong> prénom, nom, adresse e-mail, numéro de téléphone.</li>
              <li><strong>Données de localisation :</strong> position GPS en temps réel (uniquement lorsque l'application est en cours d'utilisation et avec votre consentement explicite).</li>
              <li><strong>Données de transaction :</strong> historique des commandes, réservations, transports et paiements.</li>
              <li><strong>Données professionnelles :</strong> pour les chauffeurs et prestataires, informations sur le véhicule, documents d'identité, photos de profil et certifications.</li>
              <li><strong>Données de communication :</strong> messages échangés via la messagerie intégrée de la plateforme.</li>
              <li><strong>Données techniques :</strong> adresse IP, type d'appareil, version du système d'exploitation, journaux d'accès et rapports d'erreurs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Finalités du traitement</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Créer et gérer votre compte utilisateur.</li>
              <li>Faciliter la mise en relation entre clients et prestataires/chauffeurs.</li>
              <li>Traiter les paiements et gérer les transactions financières.</li>
              <li>Afficher votre position sur la carte en temps réel lors d'une prestation en cours.</li>
              <li>Envoyer des notifications relatives à votre activité sur la plateforme.</li>
              <li>Prévenir la fraude et assurer la sécurité de la plateforme.</li>
              <li>Améliorer nos services grâce à des analyses agrégées et anonymisées.</li>
              <li>Respecter nos obligations légales et réglementaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Partage avec des tiers</h2>
            <p className="mb-2">Nous faisons appel à des prestataires de services tiers pour faire fonctionner la plateforme. Ces partenaires traitent vos données uniquement dans le cadre des missions qui leur sont confiées :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> — traitement des paiements par carte bancaire (aucune donnée de carte n'est stockée sur nos serveurs).</li>
              <li><strong>Twilio</strong> — envoi de SMS de vérification et de notifications.</li>
              <li><strong>Mapbox</strong> — affichage des cartes, calcul d'itinéraires et géocodage d'adresses.</li>
              <li><strong>Cloudinary</strong> — hébergement et optimisation des photos de profil et des documents.</li>
              <li><strong>Sentry</strong> — surveillance des erreurs techniques et amélioration de la stabilité de l'application.</li>
              <li><strong>Firebase / Google</strong> — envoi de notifications push sur appareils iOS et Android.</li>
            </ul>
            <p className="mt-2">Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Conservation des données</h2>
            <p>
              Vos données sont conservées pendant toute la durée de votre relation avec CheckAll@t, augmentée des délais légaux applicables (généralement 5 ans pour les données comptables et transactionnelles). En cas de suppression de votre compte, vos données personnelles sont anonymisées dans un délai de 30 jours, à l'exception des données nécessaires au respect d'obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Vos droits</h2>
            <p className="mb-2">Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Droit d'accès :</strong> obtenir une copie des données vous concernant.</li>
              <li><strong>Droit de rectification :</strong> corriger des données inexactes ou incomplètes.</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données (sous réserve des obligations légales).</li>
              <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements, notamment à des fins de prospection.</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré et lisible par machine.</li>
              <li><strong>Droit de retirer votre consentement</strong> à tout moment pour les traitements basés sur celui-ci (ex. : géolocalisation).</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@checkallat.com</strong>. Nous répondrons dans un délai de 30 jours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, toute perte ou toute divulgation. Les communications entre votre appareil et nos serveurs sont chiffrées via HTTPS/TLS. Les mots de passe sont stockés sous forme hachée et ne sont jamais lisibles, même par nos équipes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Cookies et technologies similaires</h2>
            <p>
              L'application mobile n'utilise pas de cookies. Le panneau d'administration web utilise uniquement un cookie de session sécurisé nécessaire à votre authentification, sans tracking publicitaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Modifications de la politique</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique à tout moment. Toute modification significative vous sera notifiée par e-mail ou via une notification dans l'application au moins 15 jours avant son entrée en vigueur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>
              Pour toute question relative à cette politique ou à vos données personnelles :<br />
              <strong>Email :</strong> privacy@checkallat.com<br />
              <strong>Support général :</strong> support@checkallat.com
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
