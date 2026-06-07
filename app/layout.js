import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata = {
  title: 'Spendly — Team Expense Tracker',
  description: 'Submit receipts, track budgets, approve requests — all in one workspace.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}