'use client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background dark:bg-black">
      <Header />
      <AdminPanel />
      <Footer />
    </div>
  );
}
