'use client';

import { useState } from 'react';

/**
 * Couleur d'une carte de secteur : unie ou en dégradé (dégradés prêts à l'emploi, nuancier
 * de couleurs, couleurs libres). Rendu vertical (haut → bas), identique à l'application.
 */

type Gradient = [string, string];

const PRESET_GROUPS: { label: string; gradients: { name: string; colors: Gradient }[] }[] = [
  {
    label: 'Chauds',
    gradients: [
      { name: 'Soleil', colors: ['#F8B400', '#E09E00'] },
      { name: 'Mangue', colors: ['#FFB347', '#FF7E36'] },
      { name: 'Coucher de soleil', colors: ['#FF7E5F', '#FEB47B'] },
      { name: 'Corail', colors: ['#FF6B6B', '#D95757'] },
      { name: 'Braise', colors: ['#F12711', '#F5AF19'] },
      { name: 'Grenade', colors: ['#C0392B', '#8E1F16'] },
      { name: 'Pêche', colors: ['#FFB199', '#FF6A88'] },
      { name: 'Terracotta', colors: ['#D35400', '#A04000'] },
    ],
  },
  {
    label: 'Froids',
    gradients: [
      { name: 'Lagon', colors: ['#00B8A9', '#008F82'] },
      { name: 'Océan', colors: ['#2193B0', '#6DD5ED'] },
      { name: 'Azur', colors: ['#3498DB', '#1F6FA8'] },
      { name: 'Nuit', colors: ['#141E30', '#243B55'] },
      { name: 'Glacier', colors: ['#74EBD5', '#9FACE6'] },
      { name: 'Saphir', colors: ['#1E3C72', '#2A5298'] },
      { name: 'Cyan', colors: ['#00C6FF', '#0072FF'] },
      { name: 'Ardoise', colors: ['#4B6CB7', '#182848'] },
    ],
  },
  {
    label: 'Nature',
    gradients: [
      { name: 'Émeraude', colors: ['#10B981', '#0D9E6E'] },
      { name: 'Menthe', colors: ['#56AB2F', '#A8E063'] },
      { name: 'Forêt', colors: ['#134E5E', '#71B280'] },
      { name: 'Olive', colors: ['#6B8E23', '#3E5214'] },
      { name: 'Sable', colors: ['#E6C79C', '#C49A6C'] },
      { name: 'Terre', colors: ['#8B5E3C', '#5C3A21'] },
      { name: 'Chocolat', colors: ['#6F4E37', '#3E2A1E'] },
      { name: 'Pistache', colors: ['#B5E48C', '#52B69A'] },
    ],
  },
  {
    label: 'Vifs',
    gradients: [
      { name: 'Améthyste', colors: ['#8B5CF6', '#7340DB'] },
      { name: 'Violet', colors: ['#8E2DE2', '#4A00E0'] },
      { name: 'Framboise', colors: ['#E94057', '#8A2387'] },
      { name: 'Magenta', colors: ['#EC008C', '#FC6767'] },
      { name: 'Aurore', colors: ['#FC466B', '#3F5EFB'] },
      { name: 'Néon', colors: ['#12C2E9', '#C471ED'] },
      { name: 'Lavande', colors: ['#B993D6', '#8CA6DB'] },
      { name: 'Fuchsia', colors: ['#DA22FF', '#9733EE'] },
    ],
  },
  {
    label: 'Sobres',
    gradients: [
      { name: 'Anthracite', colors: ['#434343', '#000000'] },
      { name: 'Acier', colors: ['#606C88', '#3F4C6B'] },
      { name: 'Graphite', colors: ['#373B44', '#4286F4'] },
      { name: 'Pierre', colors: ['#757F9A', '#D7DDE8'] },
      { name: 'Taupe', colors: ['#8E8E8E', '#5A5A5A'] },
      { name: 'Encre', colors: ['#1F2937', '#111827'] },
      { name: 'Bronze', colors: ['#B08D57', '#7A5C2E'] },
      { name: 'Or', colors: ['#D4AF37', '#AA8418'] },
    ],
  },
];

/** Nuancier : 17 teintes et des gris, 7 nuances chacune du plus clair au plus foncé (126 couleurs) */
const SWATCH_ROWS: { hue: string; shades: string[] }[] = [
  { hue: 'Rouge',       shades: ['#FECACA', '#FCA5A5', '#F87171', '#EF4444', '#DC2626', '#B91C1C', '#7F1D1D'] },
  { hue: 'Corail',      shades: ['#FFD6CC', '#FFB199', '#FF8A73', '#FF6B6B', '#E85A4F', '#C0392B', '#8E1F16'] },
  { hue: 'Orange',      shades: ['#FED7AA', '#FDBA74', '#FB923C', '#F97316', '#EA580C', '#C2410C', '#7C2D12'] },
  { hue: 'Ambre',       shades: ['#FDE68A', '#FCD34D', '#FBBF24', '#F59E0B', '#D97706', '#B45309', '#78350F'] },
  { hue: 'Jaune',       shades: ['#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#EAB308', '#CA8A04', '#713F12'] },
  { hue: 'Citron vert', shades: ['#ECFCCB', '#D9F99D', '#BEF264', '#A3E635', '#84CC16', '#65A30D', '#365314'] },
  { hue: 'Vert',        shades: ['#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E', '#16A34A', '#15803D', '#14532D'] },
  { hue: 'Émeraude',    shades: ['#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669', '#047857', '#064E3B'] },
  { hue: 'Sarcelle',    shades: ['#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6', '#0D9488', '#0F766E', '#134E4A'] },
  { hue: 'Cyan',        shades: ['#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4', '#0891B2', '#0E7490', '#164E63'] },
  { hue: 'Ciel',        shades: ['#BAE6FD', '#7DD3FC', '#38BDF8', '#0EA5E9', '#0284C7', '#0369A1', '#0C4A6E'] },
  { hue: 'Bleu',        shades: ['#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E3A8A'] },
  { hue: 'Indigo',      shades: ['#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1', '#4F46E5', '#4338CA', '#312E81'] },
  { hue: 'Violet',      shades: ['#DDD6FE', '#C4B5FD', '#A78BFA', '#8B5CF6', '#7C3AED', '#6D28D9', '#4C1D95'] },
  { hue: 'Pourpre',     shades: ['#F5D0FE', '#F0ABFC', '#E879F9', '#D946EF', '#C026D3', '#A21CAF', '#701A75'] },
  { hue: 'Rose',        shades: ['#FBCFE8', '#F9A8D4', '#F472B6', '#EC4899', '#DB2777', '#BE185D', '#831843'] },
  { hue: 'Brun',        shades: ['#E7D3C0', '#D2B48C', '#C49A6C', '#A0714F', '#8B5E3C', '#6F4E37', '#3E2A1E'] },
  { hue: 'Gris',        shades: ['#F3F4F6', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#111827'] },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const css = ([from, to]: Gradient) => `linear-gradient(180deg, ${from}, ${to})`;

interface Props {
  /** Couleurs effectives (personnalisées ou par défaut du secteur) */
  value: Gradient;
  /** Vrai si le secteur utilise ses couleurs par défaut */
  isDefault: boolean;
  onChange: (value: Gradient | null) => void;
}

/** Assombrit une couleur (#RRGGBB) : 2e couleur proposée en passant d'une couleur unie à un dégradé */
const darken = (hex: string, amount = 0.18): string => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (shift: number) => Math.max(0, Math.round(((n >> shift) & 255) * (1 - amount)));
  return `#${[16, 8, 0].map((sh) => ch(sh).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
};

type Mode = 'solid' | 'gradient';

export function GradientPicker({ value, isDefault, onChange }: Props) {
  const [from, to] = value;
  // Couleur unie = même couleur en haut et en bas (aucun changement côté serveur ni dans l'app)
  const [mode, setMode] = useState<Mode>(from.toUpperCase() === to.toUpperCase() ? 'solid' : 'gradient');
  // Dégradé : couleur modifiée par le nuancier, haut (0) ou bas (1)
  const [target, setTarget] = useState<0 | 1>(0);
  const same = (g: Gradient) => g[0].toUpperCase() === from.toUpperCase() && g[1].toUpperCase() === to.toUpperCase();
  const isSolid = mode === 'solid';

  const switchMode = (next: Mode) => {
    setMode(next);
    if (next === 'solid') onChange([from, from]);
    else if (from.toUpperCase() === to.toUpperCase()) onChange([from, darken(from)]);
  };

  const setColor = (index: 0 | 1, color: string) => {
    if (!HEX_RE.test(color)) return;
    if (isSolid) {
      onChange([color, color]);
      return;
    }
    const next: Gradient = index === 0 ? [color, to] : [from, color];
    if (HEX_RE.test(next[0]) && HEX_RE.test(next[1])) onChange(next);
  };

  const swatchSelected = (c: string) =>
    (isSolid ? from : value[target]).toUpperCase() === c.toUpperCase();

  return (
    <div className="space-y-3">
      {/* Type de fond */}
      <div className="inline-flex rounded-lg bg-gray-100 p-0.5 text-sm font-medium">
        {([
          ['solid', 'Unie'],
          ['gradient', 'Dégradé'],
        ] as const).map(([key, label]) => (
          <button
            type="button"
            key={key}
            onClick={() => switchMode(key)}
            className={`rounded-md px-4 py-1.5 transition-colors ${
              mode === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Dégradés prêts à l'emploi */}
      {!isSolid && (
        <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
          {PRESET_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{group.label}</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {group.gradients.map((g) => {
                  const active = same(g.colors);
                  return (
                    <button
                      type="button"
                      key={g.name}
                      title={`${g.name} (${g.colors.join(' → ')})`}
                      onClick={() => onChange(g.colors)}
                      className={`h-10 rounded-md border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        active ? 'border-gray-900 ring-2 ring-white ring-inset' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ background: css(g.colors) }}
                    >
                      <span className="sr-only">{g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nuancier : couleur unie, ou couleur du haut / du bas du dégradé */}
      <div className={`space-y-2 ${isSolid ? '' : 'border-t pt-3'}`}>
        {!isSolid && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Nuancier — couleur à modifier :</span>
            {([0, 1] as const).map((i) => (
              <button
                type="button"
                key={i}
                onClick={() => setTarget(i)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
                  target === i ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="h-4 w-4 rounded-full border" style={{ background: value[i] }} />
                {i === 0 ? 'Haut' : 'Bas'}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-1">
          {SWATCH_ROWS.map((row) => (
            <div key={row.hue} className="flex items-center gap-1">
              <span className="w-20 shrink-0 text-[11px] text-gray-500">{row.hue}</span>
              {row.shades.map((c) => {
                const active = swatchSelected(c);
                return (
                  <button
                    type="button"
                    key={c}
                    title={c}
                    onClick={() => setColor(target, c)}
                    className={`h-6 w-6 rounded border transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-1' : 'border-black/10'
                    }`}
                    style={{ background: c }}
                  >
                    <span className="sr-only">{c}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Couleur libre */}
      <div className="flex flex-wrap items-center gap-3 border-t pt-3">
        <span className="text-sm text-gray-600">Personnalisé :</span>
        {(isSolid ? ([0] as const) : ([0, 1] as const)).map((i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="color"
              value={value[i]}
              onChange={(e) => setColor(i, e.target.value.toUpperCase())}
              className="h-9 w-11 cursor-pointer rounded border"
              aria-label={isSolid ? 'Couleur' : i === 0 ? 'Couleur du haut' : 'Couleur du bas'}
            />
            <input
              key={value[i]}
              defaultValue={value[i]}
              onBlur={(e) => setColor(i, e.target.value.trim().toUpperCase())}
              maxLength={7}
              className="w-24 rounded-md border border-gray-300 px-2 py-1.5 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={isSolid ? 'Code couleur' : i === 0 ? 'Code couleur du haut' : 'Code couleur du bas'}
            />
          </div>
        ))}
        {!isSolid && (
          <button
            type="button"
            onClick={() => onChange([to, from])}
            className="rounded-md border px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
            title="Inverser le sens du dégradé"
          >
            ⇅ Inverser
          </button>
        )}
        {!isDefault && (
          <button
            type="button"
            onClick={() => { setMode('gradient'); onChange(null); }}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Couleurs par défaut
          </button>
        )}
      </div>
    </div>
  );
}
