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
              CheckAll@t est une plateforme numérique de mise en relation permettant à des utilisateurs de rechercher, réserver et interagir avec des prestataires, vendeurs et partenaires proposant différents types de services et de produits.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Services de transport et de déménagement :</strong> mise en relation avec des chauffeurs et transporteurs professionnels disposant de véhicules adaptés.</li>
              <li><strong>Services à domicile et de proximité :</strong> plomberie, électricité, menuiserie, peinture, nettoyage, réparation, assistance et autres métiers similaires.</li>
              <li><strong>Auto-Moto :</strong> dépannage, entretien, réparation, remorquage, assistance et prestations liées aux véhicules.</li>
              <li><strong>Tourisme :</strong> activités, visites, excursions, expériences et services liés au voyage.</li>
              <li><strong>Marketplace :</strong> achat et vente de produits ou services proposés par des vendeurs ou partenaires vérifiés.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t agit en qualité d’intermédiaire technique et organisationnel. Sauf mention contraire, les contrats relatifs aux services ou produits sont conclus directement entre l’utilisateur et le prestataire, vendeur ou partenaire concerné.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Inscription et compte utilisateur</h2>
            <p className="mb-2">
              L’utilisation de CheckAll@t nécessite la création d’un compte. En vous inscrivant, vous déclarez :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Avoir au moins 18 ans ou bénéficier d’une autorisation légale appropriée.</li>
              <li>Fournir des informations exactes, complètes et à jour.</li>
              <li>Ne pas créer de faux compte ni usurper l’identité d’un tiers.</li>
              <li>Être responsable de la confidentialité de vos identifiants de connexion.</li>
              <li>Informer CheckAll@t de toute modification importante de vos informations personnelles ou professionnelles.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t se réserve le droit de suspendre, limiter ou supprimer tout compte en cas de non-respect des présentes conditions, de fraude, d’abus, ou de comportement susceptible de nuire à la plateforme ou à d’autres utilisateurs.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Inscription comme prestataire, vendeur ou partenaire</h2>
            <p className="mb-2">
              Pour proposer des services ou produits sur CheckAll@t, les prestataires, vendeurs et partenaires doivent :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Soumettre un dossier d’inscription complet avec les documents requis.</li>
              <li>Attendre la validation de leur profil avant de pouvoir publier ou vendre.</li>
              <li>Maintenir leurs informations à jour, notamment leurs tarifs, disponibilités, zones d’intervention ou stocks.</li>
              <li>Respecter les engagements pris envers les utilisateurs.</li>
              <li>Informer sans délai CheckAll@t de tout événement pouvant affecter leur capacité à fournir le service ou le produit annoncé.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Paiements, commissions et reversements</h2>
            <p className="mb-2">
              Les paiements sur CheckAll@t peuvent s’effectuer selon les moyens disponibles dans l’application, notamment :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Carte bancaire ou autre moyen de paiement électronique pris en charge par la plateforme.</li>
              <li>Paiement local ou alternatif, selon le pays et les options activées.</li>
              <li>Paiement en espèces, lorsque cette option est expressément autorisée pour un service donné.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t perçoit une commission sur certaines transactions réalisées via la plateforme. Le montant ou le pourcentage de cette commission peut varier selon le type de service, le pays, le segment du prestataire et la nature de l’opération. Les modalités applicables sont communiquées aux utilisateurs concernés avant validation.
            </p>
            <p className="mt-2">
              Lorsque le paiement s’effectue en dehors de la plateforme, ou selon un mode spécifique autorisé, l’utilisateur et le prestataire restent tenus de respecter les règles de commission, de déclaration et de traçabilité définies par CheckAll@t.
            </p>
            <p className="mt-2">
              Les reversements aux prestataires peuvent être effectués selon les moyens de paiement et de payout disponibles dans le pays concerné. CheckAll@t peut adapter ses procédures de reversement en fonction des contraintes techniques, réglementaires ou bancaires locales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Réservations, annulations et remboursements</h2>
            <p className="mb-2">
              Les conditions de réservation, d’annulation et de remboursement peuvent varier selon le type de service, le type de produit, le pays et les conditions du prestataire.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Les réservations peuvent être immédiates ou soumises à validation.</li>
              <li>Certains services ou produits peuvent être soumis à des conditions particulières d’annulation.</li>
              <li>Les annulations tardives peuvent entraîner des frais.</li>
              <li>Les remboursements, lorsqu’ils sont applicables, sont traités selon les modalités indiquées avant la confirmation de la commande.</li>
            </ul>
            <p className="mt-2">
              En cas de remboursement par carte bancaire, le délai de traitement dépend de l’établissement bancaire ou du moyen de paiement utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Évaluations et avis</h2>
            <p>
              Après une prestation, une réservation ou une transaction, les utilisateurs peuvent être invités à laisser une évaluation ou un commentaire. Les avis doivent être honnêtes, utiles, respectueux et conformes à la loi. CheckAll@t peut supprimer tout contenu diffamatoire, abusif, trompeur, injurieux ou contraire à ses règles de publication.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Responsabilités</h2>
            <p className="mb-2">
              <strong>CheckAll@t</strong> agit comme plateforme de mise en relation et ne garantit pas l’exécution parfaite de chaque service ou la conformité absolue de chaque produit proposé par un tiers.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La responsabilité de la qualité, de l’exécution et de la conformité d’une prestation ou d’un produit incombe au prestataire, vendeur ou partenaire concerné.</li>
              <li>CheckAll@t ne peut être tenu responsable des dommages indirects, pertes d’exploitation, interruptions de service ou cas de force majeure.</li>
              <li>Les utilisateurs restent responsables des informations qu’ils communiquent, de leur comportement et de l’utilisation qu’ils font de la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Litiges et médiation</h2>
            <p>
              En cas de litige entre un utilisateur et un prestataire, vendeur ou partenaire, l’utilisateur peut contacter le support de CheckAll@t via la plateforme. L’équipe peut proposer une médiation ou une analyse du dossier, sans garantie de résolution favorable dans tous les cas. Si nécessaire, les parties restent libres de recourir aux voies de droit compétentes conformément à la législation applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Propriété intellectuelle</h2>
            <p>
              L’ensemble des éléments de la plateforme CheckAll@t, notamment le logo, l’identité visuelle, les textes, les interfaces, les fonctionnalités, les contenus propriétaires et les éléments techniques, est protégé par les droits de propriété intellectuelle et appartient à Digiltizème ou à ses ayants droit. Toute reproduction, modification, distribution ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Comportements interdits</h2>
            <p className="mb-2">Il est strictement interdit :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>D’utiliser la plateforme à des fins frauduleuses, illégales ou abusives.</li>
              <li>De contourner la plateforme afin d’éviter les frais, commissions ou règles de sécurité applicables.</li>
              <li>De publier de faux avis, de fausses annonces ou des informations trompeuses.</li>
              <li>De harceler, menacer, discriminer ou insulter d’autres utilisateurs.</li>
              <li>D’usurper l’identité d’un tiers, d’un prestataire ou de CheckAll@t.</li>
              <li>D’exploiter les données de la plateforme sans autorisation.</li>
            </ul>
            <p className="mt-2">
              Tout manquement peut entraîner la suspension immédiate du compte, le retrait d’annonces ou l’accès limité à certains services, sans préjudice d’éventuelles poursuites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Modifications des CGU</h2>
            <p>
              Digiltizème se réserve le droit de modifier les présentes CGU à tout moment. Les versions mises à jour entrent en vigueur à la date indiquée, sauf disposition contraire. La poursuite de l’utilisation de la plateforme après publication des nouvelles conditions vaut acceptation de celles-ci.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>
              Pour toute question relative aux présentes CGU :<br />
              <strong>Email juridique :</strong> legal@checkallat.com<br />
              <strong>Email support :</strong> support@checkallat.com
            </p>
          </section>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-6 text-center text-xs text-gray-400">
        © 2026 CheckAll@t by <a href="https://digiltizeme-portfolio.vercel.app" className="underline hover:text-gray-600">Digiltizème</a>. Tous droits réservés. —{' '}
        <a href="https://checkallat-web-admin.vercel.app/privacy" className="underline hover:text-gray-600">Politique de confidentialité</a>
      </footer>
    </div>
  );
}