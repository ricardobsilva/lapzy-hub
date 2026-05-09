export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-bg">
      {/* Sidebar placeholder */}
      <aside className="w-60 bg-surface border-r border-surface-2 flex-shrink-0" />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Topbar placeholder */}
        <header className="h-14 bg-surface border-b border-surface-2 flex-shrink-0" />

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
