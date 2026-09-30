'use client';

import { useEffect, useState } from 'react';

interface Props {
  /** Date de création de la demande (point de départ des deux fenêtres) */
  createdAt: string;
  /** Fenêtre de priorité admin (secondes) */
  adminWindowSec: number;
  /** Délai d'acceptation après diffusion (secondes) */
  acceptWindowSec: number;
  /** « chauffeur » ou « prestataire » */
  person: string;
  /** Pluriel affiché (« chauffeurs », « prestataires ») */
  people: string;
}

const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

/**
 * Attribution d'une demande en deux temps (mêmes règles que le serveur) :
 * 1. priorité admin : l'admin peut choisir lui-même avant toute diffusion ;
 * 2. diffusion : les chauffeurs / prestataires sont notifiés, puis attribution automatique au délai.
 */
export function AssignmentCountdown({ createdAt, adminWindowSec, acceptWindowSec, person, people }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const elapsed = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
  const adminLeft = adminWindowSec - elapsed;
  const autoLeft = adminWindowSec + acceptWindowSec - elapsed;
  const phase: 'admin' | 'broadcast' | 'expired' = adminLeft > 0 ? 'admin' : autoLeft > 0 ? 'broadcast' : 'expired';

  const tone = {
    admin: { box: 'bg-indigo-50 border-indigo-300', time: 'text-indigo-700', bar: 'bg-indigo-400', title: 'text-indigo-900', text: 'text-indigo-800' },
    broadcast: { box: 'bg-yellow-50 border-yellow-300', time: 'text-yellow-700', bar: 'bg-yellow-400', title: 'text-yellow-800', text: 'text-yellow-700' },
    expired: { box: 'bg-red-50 border-red-300', time: 'text-red-700', bar: 'bg-red-400', title: 'text-red-800', text: 'text-red-700' },
  }[phase];

  // Barre de progression : les deux phases sur une même ligne de temps
  const total = adminWindowSec + acceptWindowSec;
  const adminPct = total > 0 ? (adminWindowSec / total) * 100 : 0;
  const progressPct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100;

  return (
    <div className={`rounded-lg border p-4 ${tone.box}`}>
      <div className="flex items-center gap-4">
        <div className={`w-24 text-center font-mono text-4xl font-bold tabular-nums ${tone.time}`}>
          {phase === 'admin' ? fmt(adminLeft) : phase === 'broadcast' ? fmt(autoLeft) : '00:00'}
        </div>
        <div className="flex-1">
          {phase === 'admin' && (
            <>
              <p className={`font-bold ${tone.title}`}>👤 Priorité admin — choisissez le {person} vous-même</p>
              <p className={`text-sm ${tone.text}`}>
                Aucun {person} n&apos;est encore prévenu. Passé ce délai, la demande sera envoyée aux {people} disponibles,
                puis attribuée automatiquement au bout de {Math.round(acceptWindowSec / 60)} min si personne n&apos;accepte.
              </p>
            </>
          )}
          {phase === 'broadcast' && (
            <>
              <p className={`font-bold ${tone.title}`}>📣 {people.charAt(0).toUpperCase() + people.slice(1)} prévenus — attribution automatique dans {fmt(autoLeft)}</p>
              <p className={`text-sm ${tone.text}`}>
                Le premier {person} qui accepte obtient la demande ; sinon, le mieux placé est attribué automatiquement.
                Vous pouvez toujours attribuer manuellement.
              </p>
            </>
          )}
          {phase === 'expired' && (
            <>
              <p className={`font-bold ${tone.title}`}>⏰ Délai d&apos;acceptation écoulé</p>
              <p className={`text-sm ${tone.text}`}>
                L&apos;attribution automatique a été tentée. Si aucun {person} n&apos;apparaît, attribuez-en un manuellement.
              </p>
            </>
          )}
        </div>
      </div>
      <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/70">
        <div className={`absolute inset-y-0 left-0 ${tone.bar}`} style={{ width: `${progressPct}%` }} />
        <div className="absolute inset-y-0 w-0.5 bg-gray-500/60" style={{ left: `${adminPct}%` }} title="Fin de la priorité admin" />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-500">
        <span>Priorité admin ({adminWindowSec} s)</span>
        <span>Attribution automatique</span>
      </div>
    </div>
  );
}
