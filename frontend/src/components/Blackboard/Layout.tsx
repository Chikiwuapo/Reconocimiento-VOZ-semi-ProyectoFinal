import Navbar from './Navbar'
import NotificationCenter from './NotificationCenter'

type LayoutProps = {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
  notifications?: number
  isDarkMode?: boolean
  toggleDarkMode?: () => void
}

export default function Layout({ children, pageTitle, pageSubtitle, notifications = 0, isDarkMode = false, toggleDarkMode }: LayoutProps) {
  return (
    <div className={`min-h-full ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-white'}`}>
      <Navbar notifications={notifications} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
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
          <span>© {new Date().getFullYear()} AresDigitalAcademy · Plataforma ML</span>
        </div>
      </footer>
      <NotificationCenter />
    </div>
  )
}
