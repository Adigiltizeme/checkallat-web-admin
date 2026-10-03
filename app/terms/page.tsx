import { legalRevisionLabel } from '@/lib/legal-documents';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : {legalRevisionLabel()}</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Présentation de la plateforme</h2>
            <p>
              CheckAll@t est une plateforme numérique de mise en relation permettant à des utilisateurs de rechercher, réserver et interagir avec des prestataires, vendeurs et partenaires proposant différents types de services et de produits.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Transport et déménagement de marchandises :</strong> mise en relation avec des chauffeurs et transporteurs professionnels disposant de véhicules adaptés (fourgonnette, camionnette, grand camion). <em>CheckAll@t ne propose aucun service de transport de personnes (VTC).</em></li>
              <li><strong>CheckAllPack — Livraison express 2 roues :</strong> mise en relation avec des livreurs professionnels à moto ou à vélo pour l'envoi de colis légers, courriers et petits objets. Le poids et la distance maximum sont fixés par la plateforme et affichés avant la commande ; une demande qui les dépasse doit passer par le service Transport &amp; Déménagement. Le client peut choisir des options (livraison express, signature du destinataire, colis fragile, chaîne du froid) ; l'option express entraîne un supplément dont le montant est affiché dans le détail du prix avant validation. Les livraisons « chaîne du froid » ne sont proposées qu'aux livreurs ayant déclaré un sac isotherme ; le livreur est responsable de l'exactitude de cette déclaration. Ce service est soumis aux mêmes conditions que le transport de marchandises en ce qui concerne la vérification d'identité des livreurs et la responsabilité des parties.</li>
              <li><strong>Services à domicile et de proximité :</strong> plomberie, électricité, menuiserie, peinture, nettoyage, réparation, assistance et autres métiers similaires, proposés par des prestataires professionnels vérifiés.</li>
              <li><strong>Marketplace :</strong> achat et vente de produits proposés par des vendeurs ou partenaires vérifiés.</li>
            </ul>
            <p className="mt-2">
              D'autres secteurs pourront être ajoutés à la plateforme à l'avenir. CheckAll@t agit en qualité d'intermédiaire technique et organisationnel. Sauf mention contraire, les contrats relatifs aux services ou produits sont conclus directement entre l'utilisateur et le prestataire, vendeur ou partenaire concerné.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Inscription et compte utilisateur</h2>
            <p className="mb-2">
              L'utilisation de CheckAll@t nécessite la création d'un compte. Tout compte nouvellement créé est de type <strong>client</strong> par défaut. L'accès aux fonctionnalités de prestataire (chauffeur Transport, livreur CheckAllPack ou Pro Services) ou de vendeur Marketplace nécessite une candidature distincte soumise à validation.
            </p>
            <p className="mb-2">En vous inscrivant, vous déclarez :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Avoir au moins 18 ans.</li>
              <li>Fournir des informations exactes, complètes et à jour.</li>
              <li>Ne pas créer de faux compte ni usurper l'identité d'un tiers.</li>
              <li>Être responsable de la confidentialité de vos identifiants de connexion. En cas d'oubli, le mot de passe peut être réinitialisé avec un code envoyé par SMS au numéro du compte ; toutes les sessions ouvertes sont alors déconnectées.</li>
              <li>Confirmer votre numéro de téléphone avec le code reçu par SMS : le compte n'est utilisable qu'après cette confirmation. Tout changement de numéro exige un code reçu sur le nouveau numéro.</li>
              <li>Confirmer votre adresse e-mail avec le code reçu par e-mail. Cette confirmation est recommandée pour tous ; elle est obligatoire pour déposer une candidature de chauffeur, livreur, prestataire ou vendeur dans les pays où CheckAll@t l'exige (l'application l'indique au moment de la candidature). Une nouvelle adresse doit être confirmée à nouveau.</li>
              <li>Informer CheckAll@t de toute modification importante de vos informations personnelles ou professionnelles.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t se réserve le droit de suspendre, limiter ou supprimer tout compte en cas de non-respect des présentes conditions, de fraude, d'abus, ou de comportement susceptible de nuire à la plateforme ou à d'autres utilisateurs.
            </p>
            <p className="mt-2">
              Avec votre accord, demandé une fois dans l'application, CheckAll@t mesure l'usage de l'application (écrans consultés, étapes clés) pour l'améliorer ; ce choix est facultatif, sans effet sur l'accès aux services, et modifiable à tout moment dans Profil → Mesure d'usage (voir la Politique de confidentialité).
            </p>
            <p className="mt-2">
              Vous pouvez supprimer votre compte à tout moment depuis l'application (Profil → Supprimer mon compte), à condition de n'avoir aucune commande ou prestation en cours, aucun versement en attente et aucun solde impayé envers la plateforme. La suppression est définitive ; les activités de prestataire (chauffeur, livreur, pro, vendeur) rattachées au compte sont clôturées en même temps.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Inscription comme prestataire, vendeur ou partenaire</h2>
            <p className="mb-2">
              Pour proposer des services ou produits sur CheckAll@t, les prestataires, vendeurs et partenaires doivent :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Soumettre un dossier d'inscription complet avec les documents requis.</li>
              <li>Attendre la validation de leur profil avant de pouvoir proposer leurs services ou produits.</li>
              <li>Maintenir leurs informations à jour (tarifs, disponibilités, zones d'intervention, stocks).</li>
              <li>Respecter les engagements pris envers les utilisateurs.</li>
              <li>Informer sans délai CheckAll@t de tout événement pouvant affecter leur capacité à fournir le service ou le produit annoncé.</li>
            </ul>
            <p className="mt-3 mb-2"><strong>Véhicule des chauffeurs et livreurs.</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Le chauffeur ou livreur s'engage, lors de sa candidature, à effectuer ses courses <strong>uniquement avec le véhicule déclaré et validé</strong>. L'utilisation d'un autre véhicule entraîne la suspension du compte.</li>
              <li>Tout véhicule motorisé, deux-roues compris, doit être immatriculé et assuré. Le permis de conduire est exigé, sauf pour un cyclomoteur (≤ 50 cm³ ou électrique ≤ 4 kW) dans les pays où la réglementation ne l'impose pas. Les vélos à assistance électrique dépassant 25 km/h (speed bikes) et les scooters électriques sont des véhicules motorisés.</li>
              <li>Le livreur à vélo fournit des photos de son vélo, dont une de lui avec son vélo ; aucun document (facture, assurance, immatriculation) n'est exigé. Pendant les courses, sa vitesse moyenne est contrôlée : une vitesse incompatible avec un vélo déclenche un avertissement puis une vérification de son compte par l'équipe CheckAll@t.</li>
              <li>Tout changement de véhicule (type, catégorie ou immatriculation) doit être déclaré dans l'application avec les pièces correspondantes. Le compte ne reçoit plus de courses jusqu'à la validation du nouveau véhicule.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3 bis. Pays d'activité, géolocalisation et commandes à distance</h2>
            <p className="mb-2">
              Lors de la première ouverture de l'application, CheckAll@t peut demander l'accès à la position GPS de l'utilisateur afin de détecter automatiquement son pays de résidence. Cette détection est utilisée pour pré-remplir les paramètres du compte (devise, zone de services, langue) et permettre aux prestataires de confirmer leur pays d'activité lors de leur candidature.
            </p>
            <p className="mb-2">
              La permission de géolocalisation peut être refusée sans empêcher la création du compte. Lors d'une mission active (transport ou prestation en cours), la position GPS du prestataire est partagée en temps réel avec le client pour permettre le suivi de la prestation.
            </p>
            <p className="mb-2">
              Les utilisateurs peuvent changer leur pays actif depuis leurs paramètres de compte, notamment en cas de déplacement vers un autre pays supporté par la plateforme.
            </p>
            <p className="mb-2">
              Les utilisateurs peuvent passer des <strong>commandes à distance</strong>, c'est-à-dire commander depuis un pays différent de celui où la prestation sera effectuée (par exemple pour un proche). Dans ce cas, la prestation est réalisée par un prestataire du pays sélectionné, selon les tarifs et conditions applicables dans ce pays.
            </p>
            <p>
              Si l'utilisateur se trouve dans un pays non supporté par CheckAll@t, l'application l'en informe et lui propose de sélectionner un pays supporté pour passer sa commande.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3 ter. Vérification d'identité (KYC)</h2>
            <p className="mb-2">
              Dans le cadre de la lutte contre la fraude et conformément aux obligations réglementaires applicables, CheckAll@t soumet les chauffeurs, transporteurs et prestataires à un processus de vérification d'identité (Know Your Customer — KYC). Ce processus implique :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La fourniture d'une pièce d'identité officielle en cours de validité (carte nationale d'identité, passeport ou titre de séjour), sous forme de photo recto et, selon le document, verso.</li>
              <li>La fourniture d'une photo de type selfie afin de rapprocher l'identité déclarée du document transmis.</li>
              <li>L'exactitude et l'authenticité de tous les documents soumis. Tout document falsifié ou incomplet entraînera le rejet de la candidature et peut faire l'objet de signalement aux autorités compétentes.</li>
            </ul>
            <p className="mt-2">
              CheckAll@t se réserve le droit de demander un renouvellement des documents KYC à tout moment, notamment en cas d'expiration ou de suspicion de fraude. Les données collectées sont traitées conformément à la politique de confidentialité.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3 quater. Exigences légales et professionnelles par pays (KYB)</h2>
            <p className="mb-2">
              En plus de la vérification d'identité, certains pays imposent des exigences légales et professionnelles supplémentaires aux prestataires et chauffeurs.
            </p>
            <p className="mb-2"><strong>France :</strong> les prestataires (Pro) et chauffeurs exerçant en France sont tenus de fournir les justificatifs suivants, obligatoires avant toute activation du profil :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Statut juridique de l'activité (auto-entrepreneur, EURL, SASU, SARL, SAS ou autre).</li>
              <li>Numéro SIRET (14 chiffres, vérifié auprès du registre officiel).</li>
              <li>Code APE / NAF (code d'activité principale exercée).</li>
              <li>Attestation d'assurance Responsabilité Civile Professionnelle en cours de validité.</li>
            </ul>
            <p className="mt-2">
              D'autres pays pourront avoir leurs propres exigences légales (registre de commerce, numéro fiscal…) communiquées lors de la candidature.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Paiements, commissions et reversements</h2>
            <p className="mb-2">
              Les paiements sur CheckAll@t peuvent s'effectuer selon les moyens disponibles dans l'application :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Carte bancaire ou moyen de paiement électronique pris en charge par Stripe, avec possibilité d'enregistrer un moyen de paiement pour faciliter les transactions futures.</li>
              <li>Paiement local ou alternatif selon le pays et les options activées.</li>
              <li>Paiement en espèces, lorsque cette option est expressément autorisée pour un service donné (voir section 4 bis).</li>
            </ul>
            <p className="mt-2">
              L'enregistrement d'un moyen de paiement (carte bancaire) est géré exclusivement via Stripe, prestataire certifié PCI-DSS. Aucune donnée de carte bancaire brute n'est stockée sur les serveurs de CheckAll@t.
            </p>
            <p className="mt-2">
              CheckAll@t perçoit une commission sur certaines transactions réalisées via la plateforme. Le taux de commission peut varier selon le type de service, le pays, le segment du prestataire (standard ou premium) et la nature de l'opération. Les modalités applicables sont communiquées au prestataire lors de son inscription.
            </p>
            <p className="mt-2">
              Les reversements aux prestataires sont effectués selon les moyens de payout disponibles dans le pays concerné (virement bancaire, IBAN/SWIFT, wallets mobiles selon le pays). CheckAll@t peut adapter ses procédures de reversement en fonction des contraintes techniques, réglementaires ou bancaires locales.
            </p>
            <p className="mt-2">
              <strong>Garantie, solde et calendrier des reversements.</strong> Le montant net revenant au chauffeur, au livreur, au prestataire ou au vendeur (après commission) est enregistré sur son solde une fois la prestation confirmée, par le client ou automatiquement. Il reste d'abord <em>en garantie</em> pendant une durée fixée par la plateforme et indiquée dans l'application, durant laquelle le client peut encore ouvrir un litige ; il devient ensuite <em>disponible</em> et reste conservé par CheckAll@t sur le solde du bénéficiaire jusqu'au reversement. Un litige ouvert sur une opération suspend le reversement du montant correspondant jusqu'à sa résolution ; si le client est remboursé, ce montant est retiré du solde. Les reversements sont effectués, selon les règles en vigueur, à l'initiative de CheckAll@t ou automatiquement selon une périodicité (quotidienne, hebdomadaire, bimensuelle ou mensuelle), éventuellement à partir d'un montant minimal par pays, sur le compte de versement renseigné par le bénéficiaire.
            </p>
            <p className="mt-2">
              <strong>Compensation des commissions sur paiements en espèces.</strong> Le prestataire accepte que la commission due à CheckAll@t sur les prestations payées en espèces soit déduite de ses reversements ; le détail de chaque compensation figure sur le reversement concerné. Si un reversement échoue, la commission compensée redevient due. Tant que la commission due dépasse le seuil fixé pour son pays, l'acceptation de paiements en espèces peut être suspendue.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4 bis. Négociation de prix avant paiement (services)</h2>
            <p className="mb-2">
              Pour les réservations de services avec paiement intégré (carte bancaire), le flux de paiement se déroule en deux étapes distinctes :
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-2">
              <li>Le client soumet sa demande de service avec un prix estimatif. La demande est enregistrée et transmise au prestataire.</li>
              <li>Le prestataire peut accepter le prix estimatif ou proposer un ajustement (par exemple pour couvrir des matériaux supplémentaires). Le client est notifié et peut accepter ou refuser l'offre.</li>
              <li>En cas d'acceptation, le client procède au paiement sécurisé via Stripe. Les fonds sont bloqués en séquestre jusqu'à la fin de la prestation.</li>
            </ol>
            <p className="mb-2">
              <strong>En cas de refus du prix proposé par le client</strong> : si aucun paiement n'a été effectué, la demande de service est annulée et aucune transaction n'est prélevée.
            </p>
            <p className="mb-2">
              Le prix d'une réservation est toujours calculé par la plateforme d'après le tarif en vigueur dans le pays, la majoration d'urgence éventuelle et les suppléments choisis. Le montant affiché avant confirmation est celui qui est réservé ou dû.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4 bis-1. Prestations facturées à l'heure</h2>
            <p className="mb-2">
              Pour certains métiers (par exemple plomberie, électricité, bricolage, menuiserie, ménage), la prestation est facturée au temps passé, selon un tarif horaire fixé par la plateforme pour chaque pays et affiché avant la réservation :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Prix</strong> : frais de déplacement éventuels + tarif horaire × temps facturé, auxquels s'ajoutent la majoration d'urgence (réservation immédiate) et les suppléments choisis. Le prestataire ne peut pas modifier ce tarif.</li>
              <li><strong>Durée estimée</strong> : le client choisit une durée à la réservation. Elle constitue le plafond facturable : le montant correspondant est affiché comme « total maximum » et, en cas de paiement intégré, réservé sur la carte du client.</li>
              <li><strong>Temps réel</strong> : le temps est mesuré entre le démarrage de l'intervention et la fin déclarée par le prestataire dans l'application, puis facturé par tranches de 15 minutes, avec un minimum d'heures indiqué avant la réservation.</li>
              <li><strong>Dépassement</strong> : au-delà de la durée estimée, le prestataire doit demander du temps supplémentaire dans l'application. Le client l'accepte ou le refuse ; sans accord, aucun temps au-delà du plafond n'est facturé. En cas de paiement intégré, le temps supplémentaire accepté fait l'objet d'une réservation complémentaire sur la carte.</li>
              <li><strong>Prestation plus courte</strong> : seul le montant dû est débité ; le reste de la somme réservée est libéré sans frais.</li>
              <li><strong>Paiement en espèces</strong> : le montant à régler est calculé par l'application d'après le temps passé et affiché aux deux parties.</li>
              <li>Le client peut contester le temps facturé en ouvrant un litige depuis la réservation, dans le délai de réclamation applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4 ter. Paiements en espèces et mécanisme anti-fraude</h2>
            <p className="mb-2">
              Lorsque le paiement en espèces est autorisé pour un service donné, le client et le prestataire sont chacun invités à déclarer indépendamment le montant échangé. Ce mécanisme de double déclaration permet à CheckAll@t de vérifier la cohérence des montants et de calculer les commissions dues.
            </p>
            <p className="mb-2">
              En cas de divergence constatée entre les déclarations du client et du prestataire, CheckAll@t se réserve le droit :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>D'émettre des avertissements formels au compte concerné.</li>
              <li>De restreindre temporairement l'accès aux paiements en espèces.</li>
              <li>De suspendre le compte pendant une durée définie en cas de comportement répété.</li>
            </ul>
            <p className="mt-2">
              La commission CheckAll@t reste due sur le montant réel de la transaction, quel que soit le montant déclaré par l'une des parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4 ter. Frais d'annulation</h2>
            <p className="mb-2">
              Des frais d'annulation peuvent s'appliquer dans les cas suivants :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Annulation gratuite</strong> : le client est intégralement remboursé s'il annule avant le délai précédant le créneau indiqué dans l'application ; passé ce délai, aucun remboursement n'est dû.</li>
              <li><strong>Annulation tardive (transport et services)</strong> : si le client annule sans motif légitime alors que le chauffeur ou le prestataire est déjà arrivé, ou en route depuis plus que le délai indiqué dans l'application, des frais correspondant à un pourcentage du montant (affiché dans l'application avant confirmation) sont appliqués. En cas de paiement dans l'application, ces frais sont retenus sur le paiement et le reste est restitué immédiatement ; en cas de paiement en espèces, ils sont réglés avant la commande suivante.</li>
              <li><strong>Annulation par le chauffeur, le prestataire ou la plateforme</strong> : le client est intégralement remboursé.</li>
            </ul>
            <p className="mt-2">
              Les délais et le taux des frais sont fixés par CheckAll@t et affichés dans l'application au moment de l'annulation.
            </p>
            <p className="mt-2">
              En cas de remboursement par carte bancaire, le délai de traitement dépend de l'établissement bancaire ou du moyen de paiement utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4 quater. Signature électronique et documentation des prestations</h2>
            <p className="mb-2">
              À l'issue d'une prestation de transport, le client peut être invité à apposer une <strong>signature électronique</strong> dans l'application pour confirmer la bonne réception des biens. Cette signature constitue un élément de preuve pouvant être utilisé en cas de litige.
            </p>
            <p className="mb-2">
              Pour une livraison CheckAllPack avec l'option <strong>« Signature requise »</strong>, le livreur ne peut clôturer la livraison qu'après avoir recueilli la signature du destinataire sur son téléphone. Le client qui choisit cette option s'engage à informer le destinataire que sa signature sera recueillie et conservée à titre de preuve de remise.
            </p>
            <p>
              Des photos de l'état des biens ou des lieux peuvent être prises avant et après la prestation ou la livraison, par le prestataire ou le client. Ces photos sont conservées à des fins de traçabilité et de résolution de litiges éventuels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Réservations, annulations et remboursements</h2>
            <p className="mb-2">
              Les conditions de réservation, d'annulation et de remboursement peuvent varier selon le type de service, le type de produit, le pays et les conditions du prestataire.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Les réservations peuvent être immédiates ou soumises à validation par le prestataire.</li>
              <li>Certaines réservations peuvent être configurées en <strong>mode récurrent</strong> (hebdomadaire, bi-mensuel ou mensuel), avec une date de fin définie. Chaque occurrence est considérée comme une réservation distincte soumise aux mêmes conditions.</li>
              <li>Certains services permettent un mode <strong>auto-assign</strong> : la demande est publiée et des prestataires disponibles peuvent soumettre une offre. Le client choisit parmi les offres reçues.</li>
              <li>Les annulations tardives peuvent entraîner des frais (voir section 4 ter).</li>
              <li>Les remboursements, lorsqu'ils sont applicables, sont traités selon les modalités indiquées avant la confirmation de la commande.</li>
              <li><strong>Annulations automatiques</strong> : une demande qui n'a trouvé aucun chauffeur ou prestataire dans le délai prévu après le créneau, ou dont le prestataire ne s'est pas présenté, est annulée automatiquement et le client intégralement remboursé.</li>
              <li><strong>Clôture automatique</strong> : lorsque le chauffeur ou le prestataire déclare la prestation terminée, le client en est immédiatement informé par notification, avec la date limite pour confirmer ou signaler un problème ; un rappel lui est adressé avant cette date, et la clôture n'intervient jamais moins d'une heure après ce rappel. Sans confirmation ni contestation dans ce délai, la prestation est réputée acceptée et le paiement est versé au chauffeur ou au prestataire. Un litige ouvert avant l'échéance suspend la clôture automatique jusqu'à sa résolution.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Évaluations et avis</h2>
            <p>
              Après une prestation, une réservation ou une transaction, les utilisateurs peuvent être invités à laisser une évaluation multi-critères (ponctualité, qualité, propreté, courtoisie) accompagnée d'un commentaire et de photos. Les avis doivent être honnêtes, utiles, respectueux et conformes à la loi. CheckAll@t peut supprimer tout contenu diffamatoire, abusif, trompeur ou contraire à ses règles de publication. Les prestataires peuvent répondre aux avis qui les concernent.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6 bis. Messagerie intégrée et appels masqués</h2>
            <p className="mb-2">
              CheckAll@t met à disposition une messagerie intégrée permettant aux clients et prestataires de communiquer dans le cadre d'une réservation, d'un transport ou d'une commande. Cette messagerie est liée à la transaction et ne doit pas être utilisée à des fins non liées au service.
            </p>
            <p>
              Des appels téléphoniques peuvent être passés via la plateforme. Dans ce cas, les numéros réels des deux parties sont masqués : l'appel transite par un numéro relais fourni par Twilio. Les métadonnées de l'appel (durée, statut, identifiant technique) sont conservées à des fins de traçabilité. Aucun numéro réel n'est communiqué à l'autre partie via ce mécanisme.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Responsabilités</h2>
            <p className="mb-2">
              <strong>CheckAll@t</strong> agit comme plateforme de mise en relation et ne garantit pas l'exécution parfaite de chaque service ou la conformité absolue de chaque produit proposé par un tiers.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>La responsabilité de la qualité, de l'exécution et de la conformité d'une prestation ou d'un produit incombe au prestataire, vendeur ou partenaire concerné.</li>
              <li>CheckAll@t ne peut être tenu responsable des dommages indirects, pertes d'exploitation, interruptions de service ou cas de force majeure.</li>
              <li>Les utilisateurs restent responsables des informations qu'ils communiquent, de leur comportement et de l'utilisation qu'ils font de la plateforme.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7 bis. Obligations spécifiques des vendeurs Marketplace</h2>
            <p className="mb-2">
              Les vendeurs actifs sur la Marketplace CheckAll@t s'engagent à :
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fournir des descriptions exactes et à jour de leurs produits (description, prix, disponibilité, délai de préparation).</li>
              <li>Respecter les obligations légales applicables à leur activité (licences commerciales, certificats sanitaires si requis, réglementation locale).</li>
              <li>Honorer les commandes confirmées dans les délais annoncés.</li>
              <li>Informer CheckAll@t de tout changement affectant leur capacité à satisfaire les commandes.</li>
              <li>Accepter ou refuser chaque nouvelle commande dans le délai fixé par la plateforme ; à défaut, la commande est automatiquement annulée et le client intégralement remboursé.</li>
              <li>Ne vendre que des produits relevant des domaines de vente qui leur ont été attribués par CheckAll@t.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7 bis-1. Fonctionnement des commandes Marketplace</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Une boutique par commande :</strong> un panier ne peut contenir que les produits d'un seul vendeur.</li>
              <li><strong>Paiement :</strong> le paiement s'effectue exclusivement dans l'application. Le montant est d'abord autorisé, puis débité lorsque le vendeur accepte la commande. En cas de refus, d'expiration ou d'annulation avant préparation, l'autorisation est levée ou le montant intégralement remboursé.</li>
              <li><strong>Modes de livraison :</strong> selon la boutique et la commande, le client peut choisir la livraison par un coursier deux-roues CheckAllPack, la livraison par un véhicule CheckAll@t lorsque la commande dépasse les limites du coursier, la livraison assurée par le vendeur ou le retrait en boutique. Les frais correspondants sont affichés avant paiement.</li>
              <li><strong>Codes de remise :</strong> pour le retrait en boutique et la livraison par le vendeur, un code est remis au client ; sa communication au vendeur vaut confirmation de la remise de la commande.</li>
              <li><strong>Réception :</strong> dès la livraison, le client est informé par notification de la date limite pour confirmer la réception ou signaler un problème ; un rappel lui est adressé avant cette date, au moins une heure avant la clôture. À défaut de confirmation ou de réclamation, la commande est réputée reçue et le paiement reversé au vendeur.</li>
              <li><strong>Réclamations :</strong> le client peut signaler un problème (article endommagé, manquant, non conforme, livraison) depuis la commande pendant le délai de réclamation affiché dans l'application, y compris après la clôture. Une réclamation ouverte suspend la clôture et le versement au vendeur jusqu'à son examen par le support.</li>
              <li><strong>Commission :</strong> la commission CheckAll@t est déduite du montant reversé au vendeur ; elle est fixée par la plateforme (par vendeur, par domaine de vente ou par défaut) et affichée au vendeur sur chaque commande. Le prix payé par le client n'inclut aucune commission supplémentaire.</li>
              <li><strong>Livreurs :</strong> la rémunération du livreur CheckAll@t correspond aux frais de livraison, déduction faite de la commission transport applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7 ter. Segment de prestataire (standard / premium)</h2>
            <p>
              Les prestataires sont classifiés selon un segment (standard ou premium) qui peut avoir une incidence sur les conditions tarifaires (taux de commission), la mise en avant dans les résultats ou l'accès à certaines fonctionnalités. Le segment est attribué et révisé par CheckAll@t sur la base de critères objectifs communiqués aux prestataires.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Litiges et médiation</h2>
            <p>
              En cas de litige entre un utilisateur et un prestataire, vendeur ou partenaire, l'utilisateur peut contacter le support de CheckAll@t via la plateforme. L'équipe peut proposer une médiation ou une analyse du dossier en s'appuyant notamment sur les preuves disponibles (photos avant/après, signature électronique, journaux de communication), sans garantie de résolution favorable dans tous les cas. Si nécessaire, les parties restent libres de recourir aux voies de droit compétentes conformément à la législation applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments de la plateforme CheckAll@t, notamment le logo, l'identité visuelle, les textes, les interfaces, les fonctionnalités, les contenus propriétaires et les éléments techniques, est protégé par les droits de propriété intellectuelle et appartient à Digiltizème ou à ses ayants droit. Toute reproduction, modification, distribution ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Comportements interdits</h2>
            <p className="mb-2">Il est strictement interdit :</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>D'utiliser la plateforme à des fins frauduleuses, illégales ou abusives.</li>
              <li>De contourner la plateforme afin d'éviter les frais, commissions ou règles de sécurité applicables.</li>
              <li>De fausser les déclarations de montant lors d'un paiement en espèces.</li>
              <li>De publier de faux avis, de fausses annonces ou des informations trompeuses.</li>
              <li>De harceler, menacer, discriminer ou insulter d'autres utilisateurs.</li>
              <li>D'usurper l'identité d'un tiers, d'un prestataire ou de CheckAll@t.</li>
              <li>D'exploiter les données de la plateforme sans autorisation.</li>
              <li>De contourner le système d'appels masqués pour obtenir le numéro réel de l'autre partie.</li>
            </ul>
            <p className="mt-2">
              Tout manquement peut entraîner la suspension immédiate du compte, le retrait d'annonces, la restriction de certains moyens de paiement ou l'accès limité à certains services, sans préjudice d'éventuelles poursuites.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Droit applicable et juridiction</h2>
            <p className="mb-2">
              CheckAll@t opère dans plusieurs pays (Égypte, France, Sénégal, Mali et tout nouveau marché ajouté ultérieurement). Les présentes CGU sont régies par le droit applicable dans le pays de résidence de l'utilisateur et, en l'absence de règle spécifique, par le droit français.
            </p>
            <p>
              En cas de litige non résolu par voie amiable, les parties conviennent de soumettre le différend aux tribunaux compétents du pays de l'utilisateur, ou, pour les litiges impliquant des prestataires professionnels, aux juridictions compétentes selon la réglementation locale applicable.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Modifications des CGU</h2>
            <p>
              L'acceptation des présentes CGU et de la Politique de confidentialité est obligatoire lors de la création d'un compte ; la date et la version acceptées sont enregistrées.
            </p>
            <p className="mt-2">
              Digiltizème se réserve le droit de modifier les présentes CGU. La date de mise à jour est indiquée en haut de ce document. Les corrections mineures entrent en vigueur à leur publication. En cas de modification importante (nouvelles obligations, nouveaux frais, nouvelles données collectées), une nouvelle version est publiée et présentée dans l'application : l'utilisateur doit l'accepter pour continuer à utiliser la plateforme. À défaut, il est déconnecté et peut supprimer son compte à tout moment depuis l'application.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Contact</h2>
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
