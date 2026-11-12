import { AccountGate } from '@/components/AccountGate';
import { Sidebar } from '@/components/Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-muted/40">
        <AccountGate>{children}</AccountGate>
      </main>
    </div>
  );
}
