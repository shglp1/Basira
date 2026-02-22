import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'بصيرة | منصة التوجيه المهني',
  description: 'منصة عربية احترافية لاكتشاف المسار المهني المناسب.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <main>
          <div className="navbar">
            <strong>بصيرة</strong>
            <div className="links">
              <Link href="/dashboard">لوحة التحكم</Link>
              <Link href="/assessment">التقييم</Link>
              <Link href="/results">النتائج</Link>
              <Link href="/admin">الإدارة</Link>
            </div>
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
