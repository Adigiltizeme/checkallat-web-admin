export default function PrivacyPage() {
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

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : septembre 2026</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Qui sommes-nous ?</h2>
            <p>
              CheckAll@t est une plateforme de mise en relation entre utilisateurs, prestataires, vendeurs et partenaires dans différents domaines de services et de produits. La plateforme est éditée et exploitée par Digiltizème, qui agit en qualité de responsable du traitement des données personnelles collectées dans le cadre de l'utilisation du service.
            </p>
            <p className="mt-2">
              Pour toute question relative à la protection des données, vous pouvez nous contacter à l'adresse : <strong>privacy@checkallat.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Données collectées</h2>
            <p className="mb-2">
              Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme, à la sécurité des utilisateurs et à la conformité légale.
            </p>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.1 Données d'identité et de compte (tous les utilisateurs)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prénom, nom, numéro de téléphone (au format international E.164, utilisé comme identifiant unique), adresse e-mail (optionnelle).</li>
              <li>Photo de profil (hébergée sur Cloudinary).</li>
              <li>Langue préférée, pays d'inscription (<em>homeCountryId</em>) et pays actif courant (<em>activeCountryId</em>).</li>
              <li>Mot de passe stocké sous forme hachée et irréversible. Code OTP temporaire à usage unique (expiré après vérification).</li>
              <li>Indicateurs de vérification : téléphone vérifié, e-mail vérifié.</li>
              <li>Identifiant client Stripe (<em>stripeCustomerId</em>) permettant la gestion sécurisée des moyens de paiement enregistrés.</li>
              <li>Jeton de notification push Expo (<em>pushToken</em>) associé à l'appareil, nécessaire à l'envoi de notifications.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.2 Données de localisation</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Détection du pays à l'inscription</strong> : lors de la première ouverture de l'application, la position GPS peut être utilisée pour détecter automatiquement le pays de l'utilisateur et pré-remplir ses paramètres (devise, zone de services). La permission peut être refusée sans bloquer la création du compte.</li>
              <li><strong>Adresses sauvegardées</strong> : libellé, adresse complète, coordonnées GPS (latitude/longitude), étage, présence d'un ascenseur, instructions d'accès.</li>
              <li><strong>Adresses de prestation</strong> : coordonnées GPS des lieux de prise en charge et de livraison (transport) ou d'intervention (services à domicile).</li>
              <li><strong>Localisation temps réel des prestataires en mission</strong> : lorsqu'un chauffeur ou un prestataire est en cours de mission (transport ou prestation active), sa position GPS courante (<em>currentLat</em>, <em>currentLng</em>) est transmise et mise à jour en temps réel afin de permettre le suivi de la course par le client. Cette donnée est strictement limitée à la durée de la mission.</li>
              <li><strong>Permission « toujours » (iOS)</strong> : sur iOS, la permission de localisation « en arrière-plan » peut être sollicitée pour permettre la mise à jour de la position du prestataire lorsque l'application est en arrière-plan pendant une mission active. Cette permission n'est jamais activée en dehors des missions en cours.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.3 Données de transaction et de prestation</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Description de la commande ou de la réservation, date, créneau horaire, montant, devise, statut.</li>
              <li><strong>Photos avant et après prestation ou livraison</strong> : photos de l'état des biens avant chargement (<em>photosBeforeLoading</em>) et après livraison (<em>photosAfterDelivery</em>) pour le transport, photos avant et après intervention (<em>photosBeforeWork</em>, <em>photosAfterWork</em>) pour les services. Ces photos servent de preuves en cas de litige.</li>
              <li><strong>Signature électronique du client</strong> : capturée à la fin d'une prestation de transport pour confirmer la bonne réception des biens. Stockée de façon sécurisée.</li>
              <li>Photos fournies par le client pour décrire sa demande (avant intervention).</li>
              <li><strong>Double déclaration de montant cash</strong> : montant déclaré indépendamment par le client et par le prestataire en cas de paiement en espèces, utilisé à des fins de vérification anti-fraude.</li>
              <li><strong>Négociation de prix avant paiement (services)</strong> : pour les réservations de services avec paiement intégré, le prestataire peut proposer un ajustement de prix avant la confirmation du paiement. La demande est enregistrée en base de données dès sa soumission, mais aucune transaction financière n'est initiée avant acceptation explicite du prix et confirmation du paiement par le client.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.4 Données de paiement entrant</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Identifiant de méthode de paiement fourni par Stripe (token). Aucun numéro de carte bancaire brut n'est stocké sur nos serveurs.</li>
              <li>Historique des transactions : montant, devise, statut, méthode utilisée.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.5 Données de versement (payout — prestataires)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Selon le pays et le moyen de versement choisi par le prestataire : nom du titulaire du compte, nom de la banque, numéro de compte bancaire, IBAN (optionnel), code SWIFT/BIC (optionnel), code d'agence.</li>
              <li>Adresse IPA InstaPay, numéro de téléphone associé à un wallet mobile (Vodafone Cash, Orange Cash, E& Cash, Wave, Aman, Fawry).</li>
              <li>Numéro d'identification nationale (<em>nationalId</em>) — uniquement pour certains moyens de versement (Fawry) lorsque cela est requis par l'opérateur.</li>
              <li>Identifiant Stripe Connect (<em>stripeAccountId</em>) pour les versements via Stripe (prestataires éligibles).</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.6 Données de vérification d'identité (KYC — chauffeurs et prestataires)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Type de document d'identité (carte nationale d'identité, passeport ou titre de séjour).</li>
              <li>Photo recto et, selon le document, verso de la pièce d'identité.</li>
              <li>Photo de type selfie permettant de rapprocher l'identité déclarée au document transmis.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.7 Données légales et professionnelles — KYB France (chauffeurs et prestataires)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Statut juridique de l'activité (auto-entrepreneur, EURL, SASU, SARL, SAS ou autre).</li>
              <li>Numéro SIRET (14 chiffres).</li>
              <li>Code APE / NAF (code d'activité principale).</li>
              <li>Attestation d'assurance Responsabilité Civile Professionnelle (URL du document et date d'expiration).</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.8 Données spécifiques aux chauffeurs</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Type et capacité du véhicule, immatriculation, photos du véhicule, document d'assurance véhicule, permis de conduire.</li>
              <li>Disponibilité de manutentionnaires (nombre, prénoms), équipements disponibles (chariots, sangles, couvertures, outillage, matériel d'emballage).</li>
              <li>Photos du portfolio, description de l'activité.</li>
              <li>Statistiques d'activité : nombre de transports réalisés, note moyenne, taux de ponctualité.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.9 Données spécifiques aux prestataires Pro</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom commercial ou d'enseigne, biographie, catégories de services proposées.</li>
              <li>Zone d'intervention : rayon géographique et coordonnées GPS du centre de la zone.</li>
              <li>Photos du portfolio.</li>
              <li>Badge de formation Studyltizème (<em>isStudyltizemeGraduate</em>) si applicable — indique que le prestataire a suivi un programme de formation partenaire.</li>
              <li>Segment tarifaire (standard ou premium) ayant un impact sur les conditions de commission applicables.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.10 Données spécifiques aux vendeurs Marketplace</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom commercial, type d'activité, description, logo.</li>
              <li>Adresse du commerce et coordonnées GPS.</li>
              <li>Numéro de licence commerciale (<em>licenseNumber</em>) et certificat sanitaire (<em>healthCertificate</em>), lorsque requis selon l'activité et le pays.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.11 Données de communication</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Messages échangés via la messagerie intégrée à la plateforme (liés à une réservation, un transport ou une commande).</li>
              <li><strong>Journaux d'appels masqués</strong> (<em>CallLog</em>) : lorsqu'un appel est passé via la plateforme, les numéros réels des deux parties sont masqués et relayés par un numéro Twilio. Les métadonnées de l'appel (identifiant Twilio, durée en secondes, statut) sont conservées à des fins de traçabilité et de résolution de litiges. Les numéros réels ne sont pas communiqués à l'autre partie.</li>
              <li>Avis et évaluations : note globale et notes détaillées (ponctualité, qualité, propreté, courtoisie), commentaire, photos jointes, réponse du prestataire.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.12 Données de propositions de service</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Lorsqu'un utilisateur soumet une proposition d'ajout de service : nom du service (en français, anglais et arabe), description, public cible, estimation tarifaire, qualifications revendiquées, pièces jointes éventuelles.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.13 Données anti-fraude</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>En cas de paiement en espèces, le montant déclaré par le client et le montant déclaré par le prestataire sont enregistrés séparément et comparés automatiquement.</li>
              <li>En cas de divergence répétée, des avertissements (<em>cashFraudWarnings</em>), des restrictions temporaires (<em>isCashRestricted</em>, <em>cashRestrictionEnd</em>) ou des suspensions de compte (<em>accountSuspendedUntil</em>) peuvent être appliqués automatiquement et enregistrés.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.14 Données techniques</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Adresse IP, type d'appareil, système d'exploitation, journaux d'accès, identifiants techniques, rapports d'erreurs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Finalités du traitement</h2>
            <p className="mb-2">Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Créer et gérer votre compte utilisateur.</li>
              <li>Permettre la mise en relation entre utilisateurs et prestataires, vendeurs ou partenaires.</li>
              <li>Traiter les paiements, remboursements, commissions et reversements.</li>
              <li>Assurer le bon fonctionnement des modules proposés par CheckAll@t (transport, services, marketplace).</li>
              <li>Détecter automatiquement votre pays lors de l'inscription afin d'adapter la devise, la langue et la zone de services affichée.</li>
              <li>Permettre le suivi en temps réel de l'avancement d'une prestation ou d'un transport (localisation GPS du prestataire partagée avec le client durant la mission).</li>
              <li>Permettre aux utilisateurs en déplacement de changer leur pays actif et d'accéder aux services disponibles dans ce pays.</li>
              <li>Vous envoyer des notifications liées à vos commandes, réservations, messages ou activités sur la plateforme.</li>
              <li>Vérifier l'identité des chauffeurs, transporteurs et prestataires (KYC).</li>
              <li>Vérifier les informations légales et professionnelles des prestataires exerçant en France (KYB).</li>
              <li>Permettre l'enregistrement sécurisé de moyens de paiement via Stripe.</li>
              <li>Exécuter les versements aux prestataires via les moyens de payout disponibles par pays.</li>
              <li>Masquer les numéros de téléphone réels lors des appels entre utilisateurs et prestataires, via un relais Twilio.</li>
              <li>Collecter et conserver des preuves (photos avant/après, signature électronique) en cas de litige sur une prestation ou une livraison.</li>
              <li>Prévenir la fraude sur les paiements en espèces via la double déclaration de montant, et appliquer des restrictions de compte le cas échéant.</li>
              <li>Améliorer nos services grâce à des analyses statistiques agrégées et anonymisées.</li>
              <li>Répondre à nos obligations légales, comptables, fiscales et réglementaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Base légale du traitement</h2>
            <p className="mb-2">Selon les cas, vos données peuvent être traitées sur la base :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De l'exécution d'un contrat ou de mesures précontractuelles.</li>
              <li>De votre consentement, notamment pour certaines fonctionnalités optionnelles (géolocalisation, notifications push).</li>
              <li>Du respect d'obligations légales (KYC, KYB, conservation fiscale).</li>
              <li>De l'intérêt légitime de CheckAll@t, par exemple pour la sécurité, la prévention de la fraude ou l'amélioration du service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Partage avec des tiers</h2>
            <p className="mb-2">
              Nous faisons appel à des prestataires techniques et partenaires de confiance pour faire fonctionner la plateforme. Ils n'utilisent vos données que dans le cadre des missions qui leur sont confiées.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Stripe</strong> — traitement des paiements entrants, tokenisation et gestion sécurisée des moyens de paiement enregistrés (Stripe Customers) et versements sortants aux prestataires (Stripe Connect). Certifié PCI-DSS.</li>
              <li><strong>Twilio</strong> — envoi de SMS et codes OTP de vérification, relais d'appels téléphoniques masqués entre utilisateurs et prestataires (conservation des métadonnées d'appel).</li>
              <li><strong>Mapbox</strong> — cartographie, géocodage d'adresses et calcul d'itinéraires.</li>
              <li><strong>Cloudinary</strong> — stockage et optimisation des images et documents transmis sur la plateforme (photos de profil, pièces KYC, photos de prestation, portfolios).</li>
              <li><strong>Sentry</strong> — surveillance des erreurs techniques de l'application mobile et du backend, à des fins d'amélioration de la stabilité.</li>
              <li><strong>Firebase / Google (FCM)</strong> — infrastructure de notifications push côté serveur.</li>
              <li><strong>Expo (Expo Push Notifications)</strong> — service intermédiaire de routage des notifications push vers les appareils iOS et Android. Les jetons push (<em>pushToken</em>) sont stockés en base de données CheckAll@t et transmis à Expo pour l'envoi des notifications.</li>
            </ul>
            <p className="mt-2">
              Nous ne vendons jamais vos données personnelles à des tiers à des fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Transferts hors de votre pays</h2>
            <p>
              Certains prestataires techniques peuvent être situés dans d'autres pays. Lorsque cela est nécessaire, nous prenons des mesures appropriées pour encadrer ces transferts et protéger vos données conformément à la réglementation applicable dans chaque pays où CheckAll@t est actif.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Conservation des données</h2>
            <p>
              Vos données sont conservées pendant la durée nécessaire à la fourniture du service, puis archivées ou supprimées selon les obligations légales applicables.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Compte utilisateur</strong> : conservé tant que le compte est actif. Supprimé ou anonymisé sur demande, sous réserve des obligations légales.</li>
              <li><strong>Données de transaction</strong> : conservées selon les obligations comptables et fiscales applicables (généralement 5 à 10 ans selon le pays).</li>
              <li><strong>Documents KYC</strong> (pièce d'identité, selfie) : conservés pour la durée du profil actif, puis archivés selon les obligations de traçabilité applicables.</li>
              <li><strong>Documents KYB</strong> (SIRET, RC Pro, APE) : conservés pour la durée d'activité du prestataire sur la plateforme.</li>
              <li><strong>Photos avant/après prestation et signature électronique</strong> : conservées à des fins de résolution de litiges, puis supprimées selon les politiques de conservation définies.</li>
              <li><strong>Journaux d'appels masqués</strong> (<em>CallLog</em>) : conservés temporairement à des fins de traçabilité et de résolution de litiges.</li>
              <li><strong>Tokens de paiement Stripe</strong> : supprimés sur demande ou lors de la suppression du compte.</li>
              <li><strong>Informations de payout</strong> : conservées pour la durée d'activité du prestataire, puis supprimées sur demande.</li>
            </ul>
            <p className="mt-2">
              Lorsqu'un compte est supprimé, certaines données peuvent être conservées temporairement afin de répondre à des obligations légales, fiscales, comptables, de sécurité ou de résolution de litiges.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Vos droits</h2>
            <p className="mb-2">Conformément à la réglementation applicable, vous disposez notamment des droits suivants :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Droit d'accès à vos données.</li>
              <li>Droit de rectification des données inexactes ou incomplètes.</li>
              <li>Droit à l'effacement, dans les limites légales applicables.</li>
              <li>Droit d'opposition à certains traitements.</li>
              <li>Droit à la limitation du traitement.</li>
              <li>Droit à la portabilité, lorsque cela est applicable.</li>
              <li>Droit de retirer votre consentement à tout moment pour les traitements fondés sur celui-ci.</li>
              <li>Droit d'introduire une réclamation auprès de l'autorité de protection des données compétente dans votre pays.</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@checkallat.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre la perte, la modification, l'accès non autorisé ou la divulgation. Les échanges avec nos serveurs sont protégés par chiffrement TLS. Les mots de passe sont stockés sous forme hachée de manière sécurisée. L'accès aux données sensibles (KYC, documents professionnels, informations de paiement) est restreint au personnel autorisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Cookies et technologies similaires</h2>
            <p>
              L'application mobile n'utilise pas de cookies au sens classique du terme. Si un site web ou un panneau d'administration utilise des cookies ou traceurs, seuls les cookies strictement nécessaires au fonctionnement du service sont activés par défaut, sauf consentement supplémentaire requis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Modifications de la politique</h2>
            <p>
              Nous pouvons modifier cette politique afin de refléter des évolutions légales, techniques ou fonctionnelles. La date de mise à jour est indiquée en haut de ce document. En cas de changement important, une notification peut être affichée dans l'application ou envoyée par e-mail lorsque cela est approprié.
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
