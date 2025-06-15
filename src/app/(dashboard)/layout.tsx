import { Sidebar } from '@/components/sidebar'
import { Providers } from '@/components/providers'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="main-content flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </Providers>
  )
}