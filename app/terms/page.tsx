export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : mai 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Présentation de la plateforme</h2>
            <p>
              CheckAll@t est une plateforme numérique de mise en relation permettant aux particuliers de trouver et de réserver des prestataires de services dans trois secteurs d'activité :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Transport et déménagement :</strong> mise en relation avec des chauffeurs professionnels disposant de véhicules adaptés.</li>
              <li><strong>Services à domicile :</strong> plomberie, électricité, menuiserie, peinture, nettoyage, et autres métiers de proximité.</li>
              <li><strong>Marketplace :</strong> achat et vente de produits auprès de vendeurs locaux vérifiés.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t agit en qualité d'intermédiaire technique et ne réalise pas directement les prestations. Les contrats de service sont conclus directement entre le client et le prestataire ou chauffeur.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Inscription et compte utilisateur</h2>
            <p className="mb-2">
              L'utilisation de CheckAll@t nécessite la création d'un compte. En vous inscrivant, vous déclarez :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Avoir au moins 18 ans ou bénéficier d'une autorisation parentale.</li>
              <li>Fournir des informations exactes, complètes et à jour.</li>
              <li>Ne posséder qu'un seul compte personnel.</li>
              <li>Être responsable de la confidentialité de vos identifiants de connexion.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t se réserve le droit de suspendre ou supprimer tout compte en cas de non-respect des présentes conditions ou de comportement frauduleux.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Inscription comme prestataire ou chauffeur</h2>
            <p className="mb-2">
              Pour proposer des services sur CheckAll@t, les prestataires et chauffeurs doivent :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Soumettre une candidature complète incluant les documents requis (pièce d'identité, assurance, etc.).</li>
              <li>Attendre la validation de leur profil par l'équipe CheckAll@t avant de pouvoir exercer.</li>
              <li>Maintenir leurs informations à jour (disponibilité, zone de service, tarifs).</li>
              <li>Respecter les engagements pris envers les clients (horaires, qualité de service).</li>
              <li>Signaler tout changement susceptible d'affecter leur capacité à exercer (suspension de permis, indisponibilité prolongée, etc.).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Paiements et commissions</h2>
            <p className="mb-2">
              Les paiements sur CheckAll@t peuvent s'effectuer par :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Carte bancaire (via Stripe), débitée au moment de la confirmation de la prestation.</li>
              <li>Espèces (cash), directement versées au prestataire ou au chauffeur, sous réserve d'acceptation.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t perçoit une <strong>commission sur chaque transaction</strong> réalisée via la plateforme. Le taux de commission varie selon le type de service et le segment du prestataire (standard ou premium). Ces taux sont disponibles dans le panneau d'administration et communiqués aux prestataires lors de leur inscription.
            </p>
            <p className="mt-2">
              En cas de paiement en espèces, le prestataire s'engage à reverser la commission due à CheckAll@t dans les délais convenus. Tout manquement peut entraîner la restriction des paiements en espèces, voire la suspension du compte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Annulations et remboursements</h2>
            <p className="mb-2">
              Les conditions d'annulation varient selon le type de service :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Transport :</strong> annulation gratuite jusqu'à 30 minutes avant le créneau convenu. Au-delà, des frais d'annulation peuvent s'appliquer.</li>
              <li><strong>Services à domicile :</strong> annulation gratuite jusqu'à 2 heures avant le rendez-vous. Des frais peuvent être facturés en cas d'annulation tardive répétée.</li>
              <li><strong>Marketplace :</strong> remboursement possible sous 48 heures après réception si le produit est non conforme ou endommagé, sous réserve de preuve.</li>
            </ul>
            <p className="mt-2">
              Les remboursements par carte bancaire sont traités dans un délai de 5 à 10 jours ouvrés selon votre établissement bancaire.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Évaluations et avis</h2>
            <p>
              Après chaque prestation, les clients peuvent laisser une évaluation et un commentaire. Les prestataires peuvent également évaluer les clients. Ces avis doivent être honnêtes, factuels et respectueux. CheckAll@t se réserve le droit de supprimer tout avis contenant des propos diffamatoires, faux ou offensants.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Responsabilités</h2>
            <p className="mb-2">
              <strong>CheckAll@t</strong> n'est pas responsable :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De la qualité ou de l'exécution des prestations réalisées par les prestataires ou chauffeurs.</li>
              <li>Des dommages causés lors d'une prestation, la responsabilité incombant au prestataire ou chauffeur concerné.</li>
              <li>Des interruptions de service liées à des cas de force majeure ou à des maintenances techniques.</li>
            </ul>
            <p className="mt-2">
              <strong>Les utilisateurs</strong> sont responsables de l'exactitude des informations fournies et de leur comportement vis-à-vis des autres utilisateurs de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Résolution des litiges</h2>
            <p>
              En cas de litige entre un client et un prestataire, nous vous invitons à contacter notre service support via l'application. Notre équipe s'efforcera de proposer une médiation dans un délai de 72 heures ouvrées. Si aucune résolution amiable n'est trouvée, les parties peuvent saisir les juridictions compétentes selon la législation locale applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments de la plateforme CheckAll@t (logo, interface, textes, algorithmes) est protégé par les droits de propriété intellectuelle et appartient exclusivement à Digiltizème, créateur de CheckAll@t. Toute reproduction, utilisation ou distribution sans autorisation écrite préalable est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Comportements interdits</h2>
            <p className="mb-2">Il est strictement interdit :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>D'utiliser la plateforme à des fins frauduleuses ou illégales.</li>
              <li>De contacter les autres utilisateurs en dehors de la plateforme pour contourner les commissions.</li>
              <li>De publier de faux avis ou des informations trompeuses.</li>
              <li>De harceler, menacer ou insulter d'autres utilisateurs.</li>
              <li>D'usurper l'identité d'un tiers ou de CheckAll@t.</li>
            </ul>
            <p className="mt-2">
              Tout manquement à ces règles peut entraîner la suspension immédiate du compte, sans préjudice de poursuites légales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Modifications des CGU</h2>
            <p>
              Digiltizème se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur la plateforme. L'utilisation continue de l'application après notification vaut acceptation des nouvelles conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU :<br />
              <strong>Email :</strong> legal@checkallat.com<br />
              <strong>Support général :</strong> support@checkallat.com
            </p>
          </section>

        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        © 2026 CheckAll@t. Tous droits réservés. —{' '}
        <a href="https://checkallat-web-admin.vercel.app/privacy" className="underline hover:text-gray-600">Politique de confidentialité</a>
      </footer>
    </div>
  );
}
