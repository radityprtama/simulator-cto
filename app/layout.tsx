import type { Metadata } from 'next';
import { Space_Grotesk, Rubik, JetBrains_Mono, Geist } from 'next/font/google';
import Script from 'next/script';
import './globals.css'; // Global styles
import { GameProvider } from '@/hooks/use-game-store';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

const rubik = Rubik({
  subsets: ['latin'],
  variable: '--font-rubik',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Sentinel CTO Simulator | Executive War Room',
  description: 'Manage Budgets, Technical Debt, and Team Morale in this high-stakes CTO Strategy Game.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(spaceGrotesk.variable, rubik.variable, jetbrainsMono.variable, "font-sans", geist.variable)}>
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
      <body suppressHydrationWarning className="bg-[#1f1633] text-slate-100 antialiased font-sans min-h-screen">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}

