import Navbar from './Navbar'
import NotificationCenter from './NotificationCenter'
import { useTheme } from '../../App'

type LayoutProps = {
  children: React.ReactNode
  pageTitle?: string
  pageSubtitle?: string
  notifications?: number
  isDarkMode?: boolean
  toggleDarkMode?: () => void
}

export default function Layout({ children, pageTitle, pageSubtitle, notifications = 0, isDarkMode = false, toggleDarkMode }: LayoutProps) {
  // Unificar el control del tema usando el contexto global
  const theme = useTheme()
  const dark = theme?.isDarkMode ?? isDarkMode
  const toggle = theme?.toggleDarkMode ?? toggleDarkMode

  return (
    <div className={`min-h-screen flex flex-col ${dark ? 'bg-[#0D0D0D] text-gray-100' : 'bg-white text-gray-900'}`}>
      <Navbar notifications={notifications} isDarkMode={dark} toggleDarkMode={toggle} />
      {pageTitle ? (
        <div className={`${dark ? 'bg-[#101010] border-b border-gray-800' : 'bg-white border-b border-slate-100'}`}>
          <div className="container-page py-2">
            <h1 className={`text-lg md:text-xl font-bold ${dark ? 'text-white' : 'text-header'}`}>{pageTitle}</h1>
            {pageSubtitle && <p className={`${dark ? 'text-gray-300' : 'text-slate-600'} mt-0.5 text-xs`}>{pageSubtitle}</p>}
          </div>
        </div>
      ) : null}
      <main className="flex-1 pb-4">
        {children}
      </main>
      <footer className={`${dark ? 'border-t border-gray-800 bg-[#0D0D0D]' : 'border-t border-slate-100 bg-white'}`}>
        <div className={`container-page py-2 text-xs flex items-center justify-between ${dark ? 'text-gray-400' : 'text-slate-500'}`}>
          <span> {new Date().getFullYear()} AresDigitalAcademy · Plataforma ML</span>
        </div>
      </footer>
      <NotificationCenter />
    </div>
  )
}
