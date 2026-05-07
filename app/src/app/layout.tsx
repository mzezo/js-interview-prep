import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JS Interview Prep',
  description: 'A practical study guide for mid-level JavaScript engineers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100 antialiased">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
