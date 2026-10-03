/**
 * Révision en vigueur des documents légaux (CGU et politique de confidentialité).
 *
 * À METTRE À JOUR à chaque modification de /terms ou /privacy :
 * - `revision` : date du jour (AAAA-MM-JJ) — c'est la « Dernière mise à jour » affichée sur les deux pages ;
 * - `requiresReacceptance` : true si le changement touche les droits ou obligations des utilisateurs
 *   (nouvelles données, nouveaux frais, nouvelles règles) ; false pour une correction mineure ;
 * - `summary` : ce qui change, en quelques lignes, montré aux utilisateurs dans l'application (3 langues).
 *
 * Au premier chargement du web-admin après déploiement, la révision est signalée au serveur :
 * en mode automatique, une nouvelle version est publiée (ré-acceptation) ; en mode manuel, elle attend
 * votre publication dans Paramètres → Documents légaux.
 */
export const LEGAL_DOCUMENTS = {
  revision: '2026-10-03',
  requiresReacceptance: true,
  summary: {
    fr:
      "Versements aux chauffeurs, livreurs, prestataires et vendeurs : période de garantie, calendrier des versements, déduction des commissions dues sur les paiements en espèces et nouveaux prestataires de versement (Paymob, Wave, pawaPay, PayDunya, CinetPay ; un autre prend le relais si l'un refuse le versement). " +
      "Fin de prestation et commandes Marketplace : le client est prévenu et relancé avant la validation automatique, et peut signaler un problème pendant le délai de réclamation. " +
      "Mesure d'usage de l'application, uniquement avec votre accord (modifiable dans Profil), conservée 13 mois au plus. " +
      "Confirmation du numéro de téléphone par code SMS à l'inscription, et de l'adresse e-mail par code (obligatoire pour candidater dans certains pays). " +
      "Prestations facturées à l'heure : tarif affiché avant réservation, durée estimée comme plafond, temps réel facturé par tranches de 15 min, dépassement uniquement avec votre accord. " +
      "Chauffeurs, livreurs et prestataires : vos gains sont affichés nets de la commission ; un chauffeur actif ne peut pas commander de transport et un livreur actif ne peut pas commander de livraison CheckAllPack (l'autre activité reste accessible). " +
      "Paiement dans l'app : le prestataire ne se met en route qu'après votre paiement. Livraisons CheckAllPack : taux de commission propre. " +
      "Chauffeurs, livreurs et prestataires : le moyen de paiement est indiqué après acceptation ; annuler trop de commandes payées dans l'app suspend temporairement les paiements en espèces.",
    en:
      'Payouts to drivers, couriers, professionals and sellers: hold period, payout schedule, deduction of commissions due on cash payments and new payout providers (Paymob, Wave, pawaPay, PayDunya, CinetPay; another one takes over if one refuses the payout). ' +
      'End of service and Marketplace orders: customers are notified and reminded before automatic confirmation, and can report a problem during the claim period. ' +
      'App usage measurement, only with your consent (can be changed in Profile), kept for 13 months at most. ' +
      'Phone number confirmed by SMS code at sign-up, and email address confirmed by code (required to apply in some countries). ' +
      'Hourly services: rate shown before booking, estimated duration as a cap, actual time billed in 15-minute steps, extra time only with your approval. ' +
      'Drivers, couriers and professionals: your earnings are shown net of commission; an active driver cannot order transport and an active courier cannot order a CheckAllPack delivery (the other activity remains available). ' +
      'In-app payment: the professional only sets off after your payment. CheckAllPack deliveries: dedicated commission rate. ' +
      'Drivers, couriers and professionals: the payment method is shown after acceptance; cancelling too many in-app paid orders temporarily suspends cash payments.',
    ar:
      'تحويل المستحقات للسائقين والموصلين والمحترفين والبائعين: فترة الضمان، جدول التحويلات، خصم العمولات المستحقة على المدفوعات النقدية ومزودو تحويل جدد (Paymob وWave وpawaPay وPayDunya وCinetPay، ويتولى مزود آخر التحويل إذا رفضه أحدهم). ' +
      'نهاية الخدمة وطلبات السوق: يتم إشعار العميل وتذكيره قبل التأكيد التلقائي، ويمكنه الإبلاغ عن مشكلة خلال مهلة الشكوى. ' +
      'قياس استخدام التطبيق بموافقتك فقط (يمكن تغييرها من الملف الشخصي)، ويُحتفظ بالبيانات 13 شهراً كحد أقصى. ' +
      'تأكيد رقم الهاتف برمز SMS عند التسجيل، وتأكيد البريد الإلكتروني برمز (إلزامي لتقديم طلب في بعض البلدان). ' +
      'الخدمات بالساعة: السعر معروض قبل الحجز، والمدة التقديرية حدّ أقصى، ويُحتسب الوقت الفعلي بشرائح من 15 دقيقة، ولا وقت إضافي إلا بموافقتك. ' +
      'السائقون والموصلون والمحترفون: تُعرض أرباحكم صافية بعد خصم العمولة؛ ولا يمكن للسائق النشط طلب نقل ولا للموصل النشط طلب توصيل CheckAllPack (يبقى النشاط الآخر متاحاً). ' +
      'الدفع عبر التطبيق: لا يتوجه مقدم الخدمة إليك إلا بعد الدفع. توصيلات CheckAllPack: نسبة عمولة خاصة بها. ' +
      'السائقون والموصلون والمحترفون: تُعرض طريقة الدفع بعد القبول، وإلغاء عدد كبير من الطلبات المدفوعة عبر التطبيق يوقف الدفع النقدي مؤقتاً.',
  },
} as const;

/** Date de révision affichée sur les pages légales (ex. « 29 septembre 2026 ») */
export const legalRevisionLabel = () =>
  new Date(`${LEGAL_DOCUMENTS.revision}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
