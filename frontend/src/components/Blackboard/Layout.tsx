import Navbar from './Navbar'
import NotificationCenter from './NotificationCenter'

type LayoutProps = {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
  notifications?: number
}

export default function Layout({ children, pageTitle, pageSubtitle, notifications = 0 }: LayoutProps) {
  return (
    <div className="min-h-full bg-white">
      <Navbar notifications={notifications} />
      {pageTitle ? (
        <div className="bg-white border-b border-slate-100">
          <div className="container-page py-6">
            <h1 className="text-2xl md:text-3xl font-bold text-header">{pageTitle}</h1>
            {pageSubtitle && <p className="text-slate-600 mt-1">{pageSubtitle}</p>}
          </div>
        </div>
      ) : null}
      <main className="pb-16">
        {children}
      </main>
      <footer className="mt-16 border-t border-slate-100">
        <div className="container-page py-8 text-sm text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Blackboard · Plataforma ML</span>
        </div>
      </footer>
      <NotificationCenter />
    </div>
  )
}
