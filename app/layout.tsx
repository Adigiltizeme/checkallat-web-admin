import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ZoneProvider } from '@/contexts/ZoneContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CheckAll@t Admin',
  description: 'Admin dashboard for CheckAll@t platform',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* Neutralise le crash web-vitals "Cannot read startTime of undefined" */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
(function() {
  // Diagnostic confirmé par la trace de pile :
  //   n.timeout → d → u → et.reportAllChanges → crash "startTime"
  // Le crash arrive dans un callback SETTIMEOUT (n.timeout), pas dans PerformanceObserver.
  // web-vitals planifie via setTimeout un flush de métriques au moment des soft-navigations.
  // Quand aucune interaction n'a eu lieu, metric.entries est [] → entries[0] est undefined
  // → TypeError: Cannot read properties of undefined (reading 'startTime').
  //
  // Fix 1 (principal) : envelopper window.setTimeout pour absorber ce TypeError précis.
  // Tous les autres TypeError sont re-lancés normalement.
  (function() {
    var _origST = window.setTimeout;
    window.setTimeout = function(fn, delay) {
      if (typeof fn === 'function') {
        var _fn = fn;
        var _rest = Array.prototype.slice.call(arguments, 2);
        fn = function() {
          try { return _fn.apply(this, _rest.length ? _rest : arguments); }
          catch(e) {
            if (!(e instanceof TypeError && String(e.message).indexOf('startTime') !== -1)) throw e;
          }
        };
        return _origST.call(window, fn, delay);
      }
      return _origST.apply(window, arguments);
    };
  })();

  // Fix 2 (secondaire) : bloquer devToolsReportSoftNavs pour désactiver le mode soft-nav
  // de l'overlay Chrome DevTools — lequel déclenche aussi des callbacks avec entries vides.
  try {
    Object.defineProperty(window, 'devToolsReportSoftNavs', {
      get: function() { return false; },
      set: function() {},
      configurable: true,
      enumerable: false
    });
  } catch(ex) {}

  // Fix 3 (filet) : addEventListener capture — couvre les erreurs qui passeraient hors timer.
  window.addEventListener('error', function(e) {
    if (e && e.message && e.message.indexOf('startTime') !== -1) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
})();
        ` }} />
      </head>
      <body className={inter.className}>
        <SettingsProvider>
          <ZoneProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ZoneProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
