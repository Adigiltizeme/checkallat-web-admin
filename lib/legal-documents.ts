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
  revision: '2026-09-30',
  requiresReacceptance: true,
  summary: {
    fr:
      "Versements aux chauffeurs, livreurs, prestataires et vendeurs : période de garantie, calendrier des versements, déduction des commissions dues sur les paiements en espèces et nouveaux prestataires de versement (Paymob, Moneroo, Wave). " +
      "Fin de prestation et commandes Marketplace : le client est prévenu et relancé avant la validation automatique, et peut signaler un problème pendant le délai de réclamation. " +
      "Mesure d'usage de l'application, uniquement avec votre accord (modifiable dans Profil), conservée 13 mois au plus. " +
      "Confirmation du numéro de téléphone par code SMS à l'inscription, et de l'adresse e-mail par code (obligatoire pour candidater dans certains pays).",
    en:
      'Payouts to drivers, couriers, professionals and sellers: hold period, payout schedule, deduction of commissions due on cash payments and new payout providers (Paymob, Moneroo, Wave). ' +
      'End of service and Marketplace orders: customers are notified and reminded before automatic confirmation, and can report a problem during the claim period. ' +
      'App usage measurement, only with your consent (can be changed in Profile), kept for 13 months at most. ' +
      'Phone number confirmed by SMS code at sign-up, and email address confirmed by code (required to apply in some countries).',
    ar:
      'تحويل المستحقات للسائقين والموصلين والمحترفين والبائعين: فترة الضمان، جدول التحويلات، خصم العمولات المستحقة على المدفوعات النقدية ومزودو تحويل جدد (Paymob وMoneroo وWave). ' +
      'نهاية الخدمة وطلبات السوق: يتم إشعار العميل وتذكيره قبل التأكيد التلقائي، ويمكنه الإبلاغ عن مشكلة خلال مهلة الشكوى. ' +
      'قياس استخدام التطبيق بموافقتك فقط (يمكن تغييرها من الملف الشخصي)، ويُحتفظ بالبيانات 13 شهراً كحد أقصى. ' +
      'تأكيد رقم الهاتف برمز SMS عند التسجيل، وتأكيد البريد الإلكتروني برمز (إلزامي لتقديم طلب في بعض البلدان).',
  },
} as const;

/** Date de révision affichée sur les pages légales (ex. « 29 septembre 2026 ») */
export const legalRevisionLabel = () =>
  new Date(`${LEGAL_DOCUMENTS.revision}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
