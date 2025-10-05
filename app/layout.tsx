import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'QuikQuill - AI Writer Agents',
  description: 'Create and manage intelligent AI writer agents for all your content needs',
  keywords: ['AI writing', 'content creation', 'writing assistant', 'AI agents'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#374151',
                fontFamily: 'Roboto Slab, sans-serif',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}