import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'QuikQuill - AI Writing Platform',
  description: 'The world\'s first multi-agent AI writing platform. Create unlimited AI writers for your content needs.',
  keywords: ['AI writing', 'content creation', 'multi-agent AI', 'writing assistant', 'QuikQuill'],
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
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                border: '1px solid #e5e7eb',
                color: '#374151',
                fontFamily: 'Roboto Slab, sans-serif',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                borderRadius: '0.5rem',
                padding: '1rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}