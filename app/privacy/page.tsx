import { legalRevisionLabel } from '@/lib/legal-documents';

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
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : {legalRevisionLabel()}</p>

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
              <li>Mot de passe stocké sous forme hachée et irréversible. Code de vérification envoyé par SMS (inscription, connexion d'un compte dont le numéro n'est pas encore confirmé, changement de numéro, changement ou réinitialisation du mot de passe) : à usage unique, valable 10 minutes, rattaché au seul numéro auquel il a été envoyé, invalidé après 5 essais erronés, avec le nombre d'essais et la date de la dernière réinitialisation du mot de passe. Lorsque le service Twilio Verify est utilisé, le code est généré et contrôlé par Twilio et n'est pas connu de CheckAll@t.</li>
              <li>Code de vérification de l'adresse e-mail (6 chiffres, envoyé à l'inscription si une adresse est fournie, à chaque changement d'adresse ou à votre demande) : valable 30 minutes, invalidé après 5 essais erronés, supprimé une fois l'adresse confirmée.</li>
              <li>Indicateurs de vérification : téléphone vérifié, e-mail vérifié.</li>
              <li>Identifiant client Stripe (<em>stripeCustomerId</em>) permettant la gestion sécurisée des moyens de paiement enregistrés.</li>
              <li>Jeton de notification push Expo (<em>pushToken</em>) associé à l'appareil, nécessaire à l'envoi de notifications.</li>
              <li>Date et version des Conditions générales d'utilisation et de la présente politique que vous avez acceptées, conservées comme preuve de votre consentement.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.2 Données de localisation</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Détection du pays à l'inscription</strong> : lors de la première ouverture de l'application, la position GPS peut être utilisée pour détecter automatiquement le pays de l'utilisateur et pré-remplir ses paramètres (devise, zone de services). La permission peut être refusée sans bloquer la création du compte.</li>
              <li><strong>Adresses sauvegardées</strong> : libellé, adresse complète, coordonnées GPS (latitude/longitude), étage, présence d'un ascenseur, instructions d'accès.</li>
              <li><strong>Adresses de prestation</strong> : coordonnées GPS des lieux de prise en charge et de livraison (transport) ou d'intervention (services à domicile).</li>
              <li><strong>Localisation temps réel des prestataires en mission</strong> : lorsqu'un chauffeur ou un prestataire est en cours de mission (transport ou prestation active), sa position GPS courante (<em>currentLat</em>, <em>currentLng</em>) est transmise et mise à jour en temps réel afin de permettre le suivi de la course par le client. Cette donnée est strictement limitée à la durée de la mission.</li>
              <li><strong>Localisation en arrière-plan des chauffeurs, livreurs et prestataires</strong> : au début d'une mission (course, livraison ou intervention), l'application explique pourquoi elle a besoin de la position en arrière-plan, puis demande la permission « Toujours » (iOS) ou « Toujours autoriser » (Android). Elle permet de continuer à partager la position avec le client lorsque l'application est en arrière-plan, par exemple pendant l'utilisation d'une application de navigation. Sur Android, une notification permanente « Mission en cours » est affichée tant que le suivi est actif. Le suivi s'arrête automatiquement à la fin de la mission, à la déconnexion, et au plus tard 12 heures après son démarrage. Aucune position n'est collectée en arrière-plan en dehors d'une mission. La permission peut être refusée : la position n'est alors partagée que lorsque l'application est ouverte.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.3 Données de transaction et de prestation</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Description de la commande ou de la réservation, date, créneau horaire, montant, devise, statut.</li>
              <li><strong>Photos avant et après prestation ou livraison</strong> : photos de l'état des biens avant chargement (<em>photosBeforeLoading</em>) et après livraison (<em>photosAfterDelivery</em>) pour le transport, photos avant et après intervention (<em>photosBeforeWork</em>, <em>photosAfterWork</em>) pour les services. Ces photos servent de preuves en cas de litige.</li>
              <li><strong>Signature électronique du client</strong> : capturée à la fin d'une prestation de transport pour confirmer la bonne réception des biens. Stockée de façon sécurisée.</li>
              <li><strong>Signature du destinataire (CheckAllPack)</strong> : lorsque le client choisit l'option « Signature requise », le livreur recueille la signature manuscrite du destinataire sur son téléphone au moment de la remise. Elle est rattachée à la livraison, sert uniquement de preuve de remise en cas de litige et suit la même durée de conservation que les autres preuves de prestation.</li>
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

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.8 Données spécifiques aux chauffeurs et livreurs</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Chauffeurs Transport & Déménagement</strong> : type et capacité du véhicule (fourgonnette, camionnette, grand camion), numéro d'immatriculation, photos du véhicule, document d'assurance, permis de conduire.</li>
              <li><strong>Livreurs CheckAllPack (2 roues)</strong> : type de véhicule (deux-roues motorisé ou vélo) et, pour un deux-roues motorisé, sa catégorie (cyclomoteur ou moto), photos du véhicule, charge maximale et distance de livraison maximale autorisées, déclaration d'équipement (sac isotherme) utilisée pour attribuer les livraisons « chaîne du froid ». Pour un deux-roues motorisé : numéro d'immatriculation, certificat d'immatriculation et permis de conduire (le permis peut être facultatif pour un cyclomoteur selon la réglementation du pays). Pour un vélo : aucune plaque ni permis, mais une photo du livreur avec son vélo et un justificatif du vélo (facture d'achat, attestation d'assurance ou contrat de location).</li>
              <li>Date à laquelle le livreur s'est engagé à n'utiliser que le véhicule déclaré, et historique des changements de véhicule soumis à validation.</li>
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
              <li>Bannière, horaires d'ouverture, délai de préparation, instructions de retrait, rayon et frais de livraison propres, domaines de vente attribués.</li>
              <li>Catalogue publié (rayons, produits, photos, prix, stock, allergènes et labels déclarés).</li>
              <li>Historique des commandes reçues, motifs de refus, montants de commission prélevés et versements.</li>
            </ul>
            <p className="mt-2">
              <strong>Pour les clients de la Marketplace</strong>, nous traitons en outre le contenu du panier, l'adresse et les instructions de livraison, le mode de livraison choisi, les codes de retrait ou de remise générés pour la commande et les avis laissés sur les produits. Le nom, le prénom et l'adresse de livraison du client sont communiqués au vendeur et, le cas échéant, au livreur CheckAll@t chargé de la course, uniquement pour l'exécution de la commande.
            </p>

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
              <li><strong>Contrôle du véhicule des livreurs à vélo</strong> : pendant une course uniquement, les positions GPS déjà transmises pour le suivi de la livraison sont utilisées pour calculer une vitesse moyenne. Une vitesse incompatible avec un vélo est enregistrée (nombre et date des occurrences, sans conservation du trajet) afin de détecter l'utilisation d'un véhicule motorisé non déclaré. Le livreur en est averti ; en cas d'occurrences répétées, l'équipe CheckAll@t procède à une vérification humaine avant toute mesure. Aucune donnée de position n'est analysée en dehors des courses.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.14 Données techniques</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Adresse IP, type d'appareil, système d'exploitation, journaux d'accès, identifiants techniques, rapports d'erreurs.</li>
              <li><strong>Date de dernière activité</strong> et, le cas échéant, date de suppression du compte : utilisées uniquement pour des statistiques globales (nombre d'utilisateurs actifs, de comptes supprimés), jamais pour un suivi individuel.</li>
            </ul>

            <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.15 Mesure d'usage de l'application (avec votre accord)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Uniquement si vous l'acceptez (question posée une fois dans l'application, choix modifiable à tout moment dans <strong>Profil → Mesure d'usage</strong>) : les écrans consultés et les étapes clés de vos parcours (ouverture de l'application, inscription, connexion, création ou annulation d'une commande, lancement d'un paiement, ouverture d'un litige, dépôt d'une candidature), avec la date, le secteur concerné, le mode de paiement choisi, le type d'appareil (iOS ou Android), la version de l'application et le pays sélectionné.</li>
              <li>Ces événements sont rattachés à un identifiant aléatoire propre à l'installation de l'application et, si vous êtes connecté, à votre compte. Aucun identifiant publicitaire, aucun contenu saisi (messages, adresses, descriptions), aucune position GPS n'est collecté à ce titre.</li>
              <li>Ces données sont hébergées par CheckAll@t sur ses propres serveurs : elles ne sont transmises à aucun service d'analyse tiers, ni utilisées à des fins publicitaires.</li>
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
              <li>Exécuter les versements aux prestataires via les moyens de payout disponibles par pays, tenir leur solde (montants en garantie, disponibles, bloqués par un litige), et compenser les commissions dues sur les paiements en espèces ; l'historique des reversements (montants, dates, références de virement) est conservé pour nos obligations comptables.</li>
              <li>Masquer les numéros de téléphone réels lors des appels entre utilisateurs et prestataires, via un relais Twilio.</li>
              <li>Collecter et conserver des preuves (photos avant/après, signature électronique) en cas de litige sur une prestation ou une livraison.</li>
              <li>Prévenir la fraude sur les paiements en espèces via la double déclaration de montant, et appliquer des restrictions de compte le cas échéant.</li>
              <li>Améliorer nos services grâce à des statistiques globales (inscriptions, utilisateurs actifs, commandes, annulations, litiges, avis).</li>
              <li>Avec votre accord, comprendre comment l'application est utilisée (écrans consultés, étapes où les parcours sont abandonnés) afin de la rendre plus simple.</li>
              <li>Répondre à nos obligations légales, comptables, fiscales et réglementaires.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Base légale du traitement</h2>
            <p className="mb-2">Selon les cas, vos données peuvent être traitées sur la base :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>De l'exécution d'un contrat ou de mesures précontractuelles.</li>
              <li>De votre consentement, notamment pour certaines fonctionnalités optionnelles (géolocalisation, notifications push, mesure d'usage de l'application).</li>
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
              <li><strong>Paymob</strong> (Égypte), <strong>Moneroo</strong> et <strong>Wave</strong> (Afrique de l'Ouest) — exécution des versements aux chauffeurs, livreurs, prestataires et vendeurs sur leur portefeuille mobile : seuls le nom du titulaire, le numéro du portefeuille, le montant et une référence du versement leur sont transmis, lorsque CheckAll@t a activé ce prestataire pour le pays concerné.</li>
              <li><strong>Twilio</strong> (dont Twilio Verify) — envoi et contrôle des codes de vérification par SMS (le numéro de téléphone et la langue de l'utilisateur lui sont transmis), relais d'appels téléphoniques masqués entre utilisateurs et prestataires (conservation des métadonnées d'appel).</li>
              <li><strong>Resend</strong> — envoi des e-mails de la plateforme (codes de vérification d'adresse, confirmations, informations sur vos commandes et candidatures) : l'adresse e-mail, le prénom et le contenu du message lui sont transmis.</li>
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
              <li><strong>Notifications de l'application</strong> (titre, message, date, lu ou non) : conservées 90 jours, puis supprimées automatiquement.</li>
              <li><strong>Mesure d'usage de l'application</strong> : conservée 13 mois au plus, puis supprimée automatiquement. Si vous retirez votre accord, les événements déjà enregistrés pour votre compte et votre appareil sont supprimés immédiatement. Lors de la suppression du compte, ils ne sont plus rattachés à votre compte.</li>
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
              <li>Droit à l'effacement, dans les limites légales applicables. Vous pouvez supprimer votre compte à tout moment depuis l'application : <strong>Profil → Supprimer mon compte</strong>, ou sans l'application en suivant la procédure décrite sur la page <a href="/account-deletion" className="text-primary underline">Suppression de compte</a>. La suppression efface immédiatement vos nom, téléphone, e-mail, photo, adresses enregistrées, documents d'identité et professionnels, cartes enregistrées (y compris chez Stripe) et coordonnées de versement non utilisées. Vos commandes, paiements et versements passés sont conservés sous forme anonymisée pour nos obligations comptables et la résolution d'éventuels litiges. La suppression n'est possible qu'en l'absence de commande en cours, de versement en attente ou de solde impayé.</li>
              <li>Droit d'opposition à certains traitements.</li>
              <li>Droit à la limitation du traitement.</li>
              <li>Droit à la portabilité, lorsque cela est applicable.</li>
              <li>Droit de retirer votre consentement à tout moment pour les traitements fondés sur celui-ci (pour la mesure d'usage : <strong>Profil → Mesure d'usage</strong>).</li>
              <li>Droit d'introduire une réclamation auprès de l'autorité de protection des données compétente dans votre pays.</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, contactez-nous à : <strong>privacy@checkallat.com</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données contre la perte, la modification, l'accès non autorisé ou la divulgation. Les échanges avec nos serveurs sont protégés par chiffrement TLS. Les mots de passe sont stockés sous forme hachée de manière sécurisée. L'accès aux données sensibles (KYC, documents professionnels, informations de paiement) est restreint au personnel autorisé. Les pièces d'identité, selfies, permis, attestations d'assurance et certificats sont conservés dans un espace de stockage privé : ils ne sont jamais accessibles par une adresse publique, mais uniquement par des liens temporaires (valables quelques minutes) générés pour leur titulaire et pour le personnel habilité de CheckAll@t ; ils ne sont jamais communiqués aux autres utilisateurs. Ils sont supprimés du stockage lorsqu'ils sont remplacés ou lors de la suppression du compte.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Cookies et technologies similaires</h2>
            <p>
              L'application mobile n'utilise pas de cookies au sens classique du terme. Avec votre accord uniquement, elle enregistre sur votre appareil un identifiant aléatoire servant à la mesure d'usage décrite à l'article 2.15 ; il n'est partagé avec aucun tiers. Si un site web ou un panneau d'administration utilise des cookies ou traceurs, seuls les cookies strictement nécessaires au fonctionnement du service sont activés par défaut, sauf consentement supplémentaire requis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Modifications de la politique</h2>
            <p>
              Nous pouvons modifier cette politique afin de refléter des évolutions légales, techniques ou fonctionnelles. La date de mise à jour est indiquée en haut de ce document. En cas de changement important (nouvelles données collectées, nouvelles finalités), une nouvelle version est publiée : l'application vous la présente à votre prochaine ouverture et vous demande de l'accepter avant de poursuivre. Si vous la refusez, vous êtes déconnecté ; vous pouvez aussi supprimer votre compte depuis l'application.
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
