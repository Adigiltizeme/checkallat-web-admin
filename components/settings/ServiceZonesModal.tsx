'use client';

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { SUPPORTED_CURRENCIES } from '@/lib/constants';

interface ServiceZone {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryCode: string;
  currency: string;
  flag: string;
  mapboxLanguage: string;
  enabled: boolean;
  requireHealthCertificate?: boolean;
}

interface ServiceZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: ServiceZone[];
  onSave: (zones: ServiceZone[]) => Promise<void>;
}

const COUNTRY_DATABASE = [
  // Afrique du Nord
  { code: 'DZ', nameFr: 'Algérie',                   nameAr: 'الجزائر',                  currency: 'DZD', flag: '🇩🇿', lang: 'ar' },
  { code: 'EG', nameFr: 'Égypte',                    nameAr: 'مصر',                       currency: 'EGP', flag: '🇪🇬', lang: 'ar' },
  { code: 'LY', nameFr: 'Libye',                     nameAr: 'ليبيا',                     currency: 'LYD', flag: '🇱🇾', lang: 'ar' },
  { code: 'MA', nameFr: 'Maroc',                     nameAr: 'المغرب',                    currency: 'MAD', flag: '🇲🇦', lang: 'ar' },
  { code: 'TN', nameFr: 'Tunisie',                   nameAr: 'تونس',                      currency: 'TND', flag: '🇹🇳', lang: 'ar' },
  { code: 'SD', nameFr: 'Soudan',                    nameAr: 'السودان',                   currency: 'SDG', flag: '🇸🇩', lang: 'ar' },
  { code: 'MR', nameFr: 'Mauritanie',                nameAr: 'موريتانيا',                 currency: 'MRU', flag: '🇲🇷', lang: 'ar' },
  // Afrique de l'Ouest
  { code: 'SN', nameFr: 'Sénégal',                   nameAr: 'السنغال',                   currency: 'XOF', flag: '🇸🇳', lang: 'fr' },
  { code: 'ML', nameFr: 'Mali',                      nameAr: 'مالي',                      currency: 'XOF', flag: '🇲🇱', lang: 'fr' },
  { code: 'CI', nameFr: "Côte d'Ivoire",             nameAr: 'ساحل العاج',                currency: 'XOF', flag: '🇨🇮', lang: 'fr' },
  { code: 'BF', nameFr: 'Burkina Faso',              nameAr: 'بوركينا فاسو',              currency: 'XOF', flag: '🇧🇫', lang: 'fr' },
  { code: 'NE', nameFr: 'Niger',                     nameAr: 'النيجر',                    currency: 'XOF', flag: '🇳🇪', lang: 'fr' },
  { code: 'GN', nameFr: 'Guinée',                    nameAr: 'غينيا',                     currency: 'GNF', flag: '🇬🇳', lang: 'fr' },
  { code: 'GM', nameFr: 'Gambie',                    nameAr: 'غامبيا',                    currency: 'GMD', flag: '🇬🇲', lang: 'en' },
  { code: 'GW', nameFr: 'Guinée-Bissau',             nameAr: 'غينيا بيساو',               currency: 'XOF', flag: '🇬🇼', lang: 'pt' },
  { code: 'CV', nameFr: 'Cap-Vert',                  nameAr: 'الرأس الأخضر',              currency: 'CVE', flag: '🇨🇻', lang: 'pt' },
  { code: 'NG', nameFr: 'Nigeria',                   nameAr: 'نيجيريا',                   currency: 'NGN', flag: '🇳🇬', lang: 'en' },
  { code: 'GH', nameFr: 'Ghana',                     nameAr: 'غانا',                      currency: 'GHS', flag: '🇬🇭', lang: 'en' },
  { code: 'LR', nameFr: 'Liberia',                   nameAr: 'ليبيريا',                   currency: 'LRD', flag: '🇱🇷', lang: 'en' },
  { code: 'SL', nameFr: 'Sierra Leone',              nameAr: 'سيراليون',                  currency: 'SLL', flag: '🇸🇱', lang: 'en' },
  { code: 'TG', nameFr: 'Togo',                      nameAr: 'توغو',                      currency: 'XOF', flag: '🇹🇬', lang: 'fr' },
  { code: 'BJ', nameFr: 'Bénin',                     nameAr: 'بنين',                      currency: 'XOF', flag: '🇧🇯', lang: 'fr' },
  // Afrique centrale
  { code: 'CM', nameFr: 'Cameroun',                  nameAr: 'الكاميرون',                 currency: 'XAF', flag: '🇨🇲', lang: 'fr' },
  { code: 'TD', nameFr: 'Tchad',                     nameAr: 'تشاد',                      currency: 'XAF', flag: '🇹🇩', lang: 'fr' },
  { code: 'CF', nameFr: 'République Centrafricaine', nameAr: 'أفريقيا الوسطى',            currency: 'XAF', flag: '🇨🇫', lang: 'fr' },
  { code: 'CG', nameFr: 'Congo',                     nameAr: 'الكونغو',                   currency: 'XAF', flag: '🇨🇬', lang: 'fr' },
  { code: 'CD', nameFr: 'Congo (RDC)',                nameAr: 'الكونغو (ك.د)',             currency: 'CDF', flag: '🇨🇩', lang: 'fr' },
  { code: 'GQ', nameFr: 'Guinée Équatoriale',        nameAr: 'غينيا الاستوائية',          currency: 'XAF', flag: '🇬🇶', lang: 'es' },
  { code: 'GA', nameFr: 'Gabon',                     nameAr: 'الغابون',                   currency: 'XAF', flag: '🇬🇦', lang: 'fr' },
  // Afrique de l'Est
  { code: 'ET', nameFr: 'Éthiopie',                  nameAr: 'إثيوبيا',                   currency: 'ETB', flag: '🇪🇹', lang: 'en' },
  { code: 'KE', nameFr: 'Kenya',                     nameAr: 'كينيا',                     currency: 'KES', flag: '🇰🇪', lang: 'en' },
  { code: 'TZ', nameFr: 'Tanzanie',                  nameAr: 'تنزانيا',                   currency: 'TZS', flag: '🇹🇿', lang: 'sw' },
  { code: 'UG', nameFr: 'Ouganda',                   nameAr: 'أوغندا',                    currency: 'UGX', flag: '🇺🇬', lang: 'en' },
  { code: 'RW', nameFr: 'Rwanda',                    nameAr: 'رواندا',                    currency: 'RWF', flag: '🇷🇼', lang: 'fr' },
  { code: 'BI', nameFr: 'Burundi',                   nameAr: 'بوروندي',                   currency: 'BIF', flag: '🇧🇮', lang: 'fr' },
  { code: 'SO', nameFr: 'Somalie',                   nameAr: 'الصومال',                   currency: 'SOS', flag: '🇸🇴', lang: 'ar' },
  { code: 'DJ', nameFr: 'Djibouti',                  nameAr: 'جيبوتي',                    currency: 'DJF', flag: '🇩🇯', lang: 'ar' },
  { code: 'ER', nameFr: 'Érythrée',                  nameAr: 'إريتريا',                   currency: 'ERN', flag: '🇪🇷', lang: 'ar' },
  // Afrique Australe
  { code: 'ZA', nameFr: 'Afrique du Sud',            nameAr: 'جنوب أفريقيا',              currency: 'ZAR', flag: '🇿🇦', lang: 'en' },
  { code: 'ZM', nameFr: 'Zambie',                    nameAr: 'زامبيا',                    currency: 'ZMW', flag: '🇿🇲', lang: 'en' },
  { code: 'ZW', nameFr: 'Zimbabwe',                  nameAr: 'زيمبابوي',                  currency: 'ZWL', flag: '🇿🇼', lang: 'en' },
  { code: 'MZ', nameFr: 'Mozambique',                nameAr: 'موزمبيق',                   currency: 'MZN', flag: '🇲🇿', lang: 'pt' },
  { code: 'AO', nameFr: 'Angola',                    nameAr: 'أنغولا',                    currency: 'AOA', flag: '🇦🇴', lang: 'pt' },
  { code: 'MG', nameFr: 'Madagascar',                nameAr: 'مدغشقر',                    currency: 'MGA', flag: '🇲🇬', lang: 'fr' },
  // Moyen-Orient
  { code: 'SA', nameFr: 'Arabie Saoudite',           nameAr: 'المملكة العربية السعودية',  currency: 'SAR', flag: '🇸🇦', lang: 'ar' },
  { code: 'AE', nameFr: 'Émirats Arabes Unis',       nameAr: 'الإمارات العربية المتحدة',  currency: 'AED', flag: '🇦🇪', lang: 'ar' },
  { code: 'QA', nameFr: 'Qatar',                     nameAr: 'قطر',                       currency: 'QAR', flag: '🇶🇦', lang: 'ar' },
  { code: 'KW', nameFr: 'Koweït',                    nameAr: 'الكويت',                    currency: 'KWD', flag: '🇰🇼', lang: 'ar' },
  { code: 'BH', nameFr: 'Bahreïn',                   nameAr: 'البحرين',                   currency: 'BHD', flag: '🇧🇭', lang: 'ar' },
  { code: 'OM', nameFr: 'Oman',                      nameAr: 'عُمان',                     currency: 'OMR', flag: '🇴🇲', lang: 'ar' },
  { code: 'JO', nameFr: 'Jordanie',                  nameAr: 'الأردن',                    currency: 'JOD', flag: '🇯🇴', lang: 'ar' },
  { code: 'LB', nameFr: 'Liban',                     nameAr: 'لبنان',                     currency: 'LBP', flag: '🇱🇧', lang: 'ar' },
  { code: 'IQ', nameFr: 'Irak',                      nameAr: 'العراق',                    currency: 'IQD', flag: '🇮🇶', lang: 'ar' },
  { code: 'SY', nameFr: 'Syrie',                     nameAr: 'سوريا',                     currency: 'SYP', flag: '🇸🇾', lang: 'ar' },
  { code: 'YE', nameFr: 'Yémen',                     nameAr: 'اليمن',                     currency: 'YER', flag: '🇾🇪', lang: 'ar' },
  { code: 'PS', nameFr: 'Palestine',                 nameAr: 'فلسطين',                    currency: 'ILS', flag: '🇵🇸', lang: 'ar' },
  { code: 'TR', nameFr: 'Turquie',                   nameAr: 'تركيا',                     currency: 'TRY', flag: '🇹🇷', lang: 'tr' },
  { code: 'IR', nameFr: 'Iran',                      nameAr: 'إيران',                     currency: 'IRR', flag: '🇮🇷', lang: 'fa' },
  // Europe
  { code: 'FR', nameFr: 'France',                    nameAr: 'فرنسا',                     currency: 'EUR', flag: '🇫🇷', lang: 'fr' },
  { code: 'BE', nameFr: 'Belgique',                  nameAr: 'بلجيكا',                    currency: 'EUR', flag: '🇧🇪', lang: 'fr' },
  { code: 'CH', nameFr: 'Suisse',                    nameAr: 'سويسرا',                    currency: 'CHF', flag: '🇨🇭', lang: 'fr' },
  { code: 'DE', nameFr: 'Allemagne',                 nameAr: 'ألمانيا',                   currency: 'EUR', flag: '🇩🇪', lang: 'de' },
  { code: 'GB', nameFr: 'Royaume-Uni',               nameAr: 'المملكة المتحدة',           currency: 'GBP', flag: '🇬🇧', lang: 'en' },
  { code: 'ES', nameFr: 'Espagne',                   nameAr: 'إسبانيا',                   currency: 'EUR', flag: '🇪🇸', lang: 'es' },
  { code: 'IT', nameFr: 'Italie',                    nameAr: 'إيطاليا',                   currency: 'EUR', flag: '🇮🇹', lang: 'it' },
  { code: 'PT', nameFr: 'Portugal',                  nameAr: 'البرتغال',                  currency: 'EUR', flag: '🇵🇹', lang: 'pt' },
  { code: 'NL', nameFr: 'Pays-Bas',                  nameAr: 'هولندا',                    currency: 'EUR', flag: '🇳🇱', lang: 'nl' },
  { code: 'LU', nameFr: 'Luxembourg',                nameAr: 'لوكسمبورغ',                 currency: 'EUR', flag: '🇱🇺', lang: 'fr' },
  // Amérique / Asie
  { code: 'CA', nameFr: 'Canada',                    nameAr: 'كندا',                      currency: 'CAD', flag: '🇨🇦', lang: 'fr' },
  { code: 'US', nameFr: 'États-Unis',                nameAr: 'الولايات المتحدة',          currency: 'USD', flag: '🇺🇸', lang: 'en' },
  { code: 'BR', nameFr: 'Brésil',                    nameAr: 'البرازيل',                  currency: 'BRL', flag: '🇧🇷', lang: 'pt' },
  { code: 'CN', nameFr: 'Chine',                     nameAr: 'الصين',                     currency: 'CNY', flag: '🇨🇳', lang: 'zh' },
  { code: 'IN', nameFr: 'Inde',                      nameAr: 'الهند',                     currency: 'INR', flag: '🇮🇳', lang: 'hi' },
];

const COUNTRY_BY_CODE: Record<string, typeof COUNTRY_DATABASE[number]> =
  Object.fromEntries(COUNTRY_DATABASE.map((c) => [c.code, c]));

const MAPBOX_LANGUAGES = [
  { code: 'ar', label: 'Arabe' },
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'Anglais' },
  { code: 'de', label: 'Allemand' },
  { code: 'es', label: 'Espagnol' },
  { code: 'it', label: 'Italien' },
  { code: 'pt', label: 'Portugais' },
  { code: 'sw', label: 'Swahili' },
  { code: 'tr', label: 'Turc' },
  { code: 'zh', label: 'Chinois' },
  { code: 'fa', label: 'Persan' },
  { code: 'he', label: 'Hébreu' },
  { code: 'hi', label: 'Hindi' },
  { code: 'nl', label: 'Néerlandais' },
];

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

const EMPTY_ZONE: ServiceZone = {
  id: '',
  name: '',
  nameAr: '',
  country: '',
  countryCode: '',
  currency: '',
  flag: '🌍',
  mapboxLanguage: 'ar',
  enabled: true,
  requireHealthCertificate: false,
};

export function ServiceZonesModal({ isOpen, onClose, zones, onSave }: ServiceZonesModalProps) {
  const [localZones, setLocalZones] = useState<ServiceZone[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ServiceZone>(EMPTY_ZONE);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      const normalized: ServiceZone[] = (Array.isArray(zones) ? zones : []).map((z) => {
        const code = (z.countryCode ?? '').toUpperCase();
        return {
          ...z,
          currency: z.currency ?? '',
          flag: (z as any).flag ?? COUNTRY_BY_CODE[code]?.flag ?? '🌍',
          mapboxLanguage: (z as any).mapboxLanguage ?? COUNTRY_BY_CODE[code]?.lang ?? 'fr',
        };
      });
      setLocalZones(normalized);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_ZONE);
    }
  }, [isOpen, zones]);

  const filteredCountries = COUNTRY_DATABASE.filter(
    (c) =>
      c.nameFr.toLowerCase().includes(countrySearch.toLowerCase()) ||
      c.code.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const applyCountryPreset = (code: string) => {
    const preset = COUNTRY_BY_CODE[code];
    if (!preset) return;
    setForm((prev) => ({
      ...prev,
      country: preset.nameFr,
      countryCode: preset.code,
      currency: preset.currency,
      flag: preset.flag,
      mapboxLanguage: preset.lang,
      nameAr: prev.nameAr || preset.nameAr,
      id: prev.id || (editingId ? prev.id : slugify(prev.name || preset.nameFr)),
    }));
    setCountrySearch('');
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_ZONE);
    setCountrySearch('');
    setShowForm(true);
  };

  const openEdit = (zone: ServiceZone) => {
    setEditingId(zone.id);
    setForm({ ...zone });
    setCountrySearch('');
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_ZONE);
    setCountrySearch('');
  };

  const toggleEnabled = (id: string) => {
    setLocalZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, enabled: !z.enabled } : z)),
    );
  };

  const deleteZone = (id: string) => {
    setLocalZones((prev) => prev.filter((z) => z.id !== id));
    setDeleteConfirm(null);
    if (editingId === id) cancelForm();
  };

  const saveForm = () => {
    const id = (form.id.trim() || slugify(form.name)).toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!id || !form.name || !form.countryCode) return;
    const zone: ServiceZone = { ...form, id };
    if (editingId) {
      setLocalZones((prev) => prev.map((z) => (z.id === editingId ? zone : z)));
    } else {
      if (localZones.some((z) => z.id === id)) {
        alert(`L'identifiant "${id}" existe déjà. Modifiez le nom de la ville.`);
        return;
      }
      setLocalZones((prev) => [...prev, zone]);
    }
    cancelForm();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localZones);
      onClose();
    } catch {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof ServiceZone>(key: K, value: ServiceZone[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !editingId) {
        next.id = slugify(value as string);
      }
      return next;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gérer les Zones de la Plateforme">
      <div className="space-y-4">

        {/* Header liste */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{localZones.length} zone(s) configurée(s)</p>
          {!showForm && (
            <button
              onClick={openAdd}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1 font-medium"
            >
              + Ajouter une zone
            </button>
          )}
        </div>

        {/* Liste des zones */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {localZones.length === 0 && (
            <p className="text-sm text-gray-400 italic py-4 text-center">Aucune zone configurée.</p>
          )}
          {localZones.map((zone) => (
            <div
              key={zone.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                editingId === zone.id ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
              } ${!zone.enabled ? 'opacity-60' : ''}`}
            >
              <span className="text-xl flex-shrink-0">{zone.flag}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {zone.name} — {zone.country}
                </p>
                <p className="text-xs text-gray-400">
                  {zone.countryCode} · {zone.currency} · Mapbox: {zone.mapboxLanguage}
                </p>
              </div>

              {/* Toggle enabled */}
              <button
                onClick={() => toggleEnabled(zone.id)}
                className={`flex-shrink-0 relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                  zone.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
                title={zone.enabled ? 'Désactiver' : 'Activer'}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                    zone.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>

              <button
                onClick={() => openEdit(zone)}
                className="p-1 text-blue-500 hover:text-blue-700 flex-shrink-0"
                title="Modifier"
              >
                ✏️
              </button>

              {deleteConfirm === zone.id ? (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => deleteZone(zone.id)}
                    className="px-2 py-0.5 text-xs bg-red-600 text-white rounded"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-2 py-0.5 text-xs border border-gray-300 rounded"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(zone.id)}
                  className="p-1 text-red-400 hover:text-red-600 flex-shrink-0"
                  title="Supprimer"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Formulaire Add / Edit */}
        {showForm && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">
              {editingId ? `✏️  Modifier : ${editingId}` : '➕  Nouvelle zone'}
            </h3>

            {/* Raccourci pays */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Raccourci — sélectionner un pays pour pré-remplir
              </label>
              <input
                type="text"
                placeholder="Rechercher (ex: Algérie, MA, Sénégal...)"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
              />
              {countrySearch && (
                <div className="mt-1 max-h-36 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-sm">
                  {filteredCountries.length === 0 && (
                    <p className="px-3 py-2 text-xs text-gray-400">Aucun résultat — remplissez manuellement ci-dessous</p>
                  )}
                  {filteredCountries.slice(0, 20).map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => applyCountryPreset(c.code)}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>{c.flag}</span>
                      <span>{c.nameFr}</span>
                      <span className="ml-auto text-xs text-gray-400">{c.code} · {c.currency}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Identifiant */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Identifiant <span className="text-red-500">*</span>
                  <span className="text-gray-400 font-normal"> (slug unique)</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: cairo, paris, dakar"
                  value={form.id}
                  onChange={(e) => setForm((p) => ({ ...p, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_') }))}
                  disabled={!!editingId}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md disabled:bg-gray-100 font-mono"
                />
              </div>

              {/* Code pays */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Code pays ISO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="EG, FR, SN, DZ..."
                  value={form.countryCode}
                  maxLength={3}
                  onChange={(e) => updateField('countryCode', e.target.value.toUpperCase())}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md uppercase font-mono"
                />
              </div>

              {/* Nom ville FR */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nom de la zone (FR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Le Caire, Paris, Dakar..."
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>

              {/* Nom ville AR */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nom de la zone (AR)</label>
                <input
                  type="text"
                  placeholder="القاهرة"
                  value={form.nameAr}
                  onChange={(e) => updateField('nameAr', e.target.value)}
                  dir="rtl"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>

              {/* Pays FR */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Pays (nom FR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Égypte, France, Sénégal..."
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>

              {/* Devise */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Devise <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1">
                  <select
                    value={Object.keys(SUPPORTED_CURRENCIES).includes(form.currency) ? form.currency : '__other'}
                    onChange={(e) => { if (e.target.value !== '__other') updateField('currency', e.target.value); }}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  >
                    {Object.keys(SUPPORTED_CURRENCIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__other">Autre…</option>
                  </select>
                  <input
                    type="text"
                    placeholder="XYZ"
                    value={form.currency}
                    maxLength={4}
                    onChange={(e) => updateField('currency', e.target.value.toUpperCase())}
                    className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono"
                  />
                </div>
              </div>

              {/* Drapeau */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Drapeau (emoji)</label>
                <input
                  type="text"
                  placeholder="🌍"
                  value={form.flag}
                  onChange={(e) => updateField('flag', e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                />
              </div>

              {/* Langue Mapbox */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Langue Mapbox</label>
                <div className="flex gap-1">
                  <select
                    value={MAPBOX_LANGUAGES.some((l) => l.code === form.mapboxLanguage) ? form.mapboxLanguage : '__other'}
                    onChange={(e) => { if (e.target.value !== '__other') updateField('mapboxLanguage', e.target.value); }}
                    className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md"
                  >
                    {MAPBOX_LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label} ({l.code})</option>
                    ))}
                    <option value="__other">Autre…</option>
                  </select>
                  <input
                    type="text"
                    placeholder="xx"
                    value={form.mapboxLanguage}
                    maxLength={5}
                    onChange={(e) => updateField('mapboxLanguage', e.target.value.toLowerCase())}
                    className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded-md font-mono"
                  />
                </div>
              </div>

              {/* Activée */}
              <div className="flex items-center gap-2 pt-3">
                <input
                  type="checkbox"
                  id="zone-enabled"
                  checked={form.enabled}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  className="accent-green-600"
                />
                <label htmlFor="zone-enabled" className="text-sm text-gray-700">Zone activée</label>
              </div>

              {/* Certificat sanitaire */}
              <div className="flex items-center gap-2 pt-3">
                <input
                  type="checkbox"
                  id="zone-health"
                  checked={form.requireHealthCertificate ?? false}
                  onChange={(e) => updateField('requireHealthCertificate', e.target.checked)}
                  className="accent-orange-600"
                />
                <label htmlFor="zone-health" className="text-sm text-gray-700">Certificat sanitaire requis</label>
              </div>
            </div>

            {/* Aperçu */}
            {(form.name || form.countryCode) && (
              <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-gray-700 flex items-center gap-2 flex-wrap">
                <span className="text-lg">{form.flag}</span>
                <strong>{form.name || '—'}, {form.country || '—'}</strong>
                <span className="text-gray-400">id: {form.id || slugify(form.name) || '—'}</span>
                <span className="text-gray-400">{form.currency}</span>
                <span className="text-gray-400">Mapbox: {form.mapboxLanguage}</span>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={saveForm}
                disabled={!form.name.trim() || !form.countryCode.trim()}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-40 font-medium"
              >
                {editingId ? 'Enregistrer les modifications' : 'Ajouter la zone'}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Actions principales */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
          >
            Fermer sans sauvegarder
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 text-sm font-medium"
          >
            {saving ? 'Enregistrement...' : 'Sauvegarder toutes les zones'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
