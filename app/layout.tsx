import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css'; // Global styles
import { GameProvider } from '@/hooks/use-game-store';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'CTO Simulator | CRT Terminal Edition',
  description: 'Retro TUI Chief Technology Officer crisis management system.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        <Script
          id="fetch-protect"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var rawFetch = window.fetch;
                  if (rawFetch) {
                    var currentFetch = rawFetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() { return currentFetch; },
                      set: function(val) { currentFetch = val; },
                      configurable: true,
                      enumerable: true
                    });
                    if (typeof Window !== 'undefined' && Window.prototype) {
                      Object.defineProperty(Window.prototype, 'fetch', {
                        get: function() { return currentFetch; },
                        set: function(val) { currentFetch = val; },
                        configurable: true,
                        enumerable: true
                      });
                    }
                  }
                } catch (e) {
                  console.warn('Fetch protection script failed:', e);
                }
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
