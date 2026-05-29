import type { Metadata } from 'next';
import { DM_Sans, Lora } from 'next/font/google';
import Script from 'next/script';
import './globals.css'; // Global styles
import { GameProvider } from '@/hooks/use-game-store';
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'Sentinel CTO Simulator | Executive War Room',
  description: 'Manage Budgets, Technical Debt, and Team Morale in this high-stakes CTO Strategy Game.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(dmSans.variable, lora.variable, "font-sans")}>
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
      <body suppressHydrationWarning className="bg-[--canvas] text-[--ink] antialiased font-sans min-h-screen">
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
