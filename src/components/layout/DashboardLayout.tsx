'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  LogOut, Stethoscope, 
  LayoutDashboard, FileText, User, Menu, X, Settings, ChevronDown, Users
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: string
  userName: string
  userAvatar?: string
}

export function DashboardLayout({ children, userRole, userName, userAvatar }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = userRole === 'admin_prodi' || userRole === 'admin_fakultas'
  const settingsPath = isAdmin ? '/admin/settings' : '/peserta/settings'

  const navLinks = isAdmin ? [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Data Pendaftar', href: '/admin/pendaftar', icon: Users },
  ] : [
    { name: 'Dashboard', href: '/peserta/dashboard', icon: LayoutDashboard },
    { name: 'Form Pendaftaran', href: '/peserta/daftar', icon: FileText },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ─ Topbar ─ */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 w-full ${
          isAdmin 
            ? scrolled 
              ? 'bg-slate-900/95 backdrop-blur-md shadow-md border-b border-slate-800'
              : 'bg-slate-900 border-b border-slate-800'
            : scrolled 
              ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200' 
              : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-xl w-10 h-10 ${isAdmin ? 'bg-emerald-500' : 'bg-emerald-600'} text-white`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`font-bold leading-none ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
                PPDS FK UNAND
              </h1>
              <p className={`text-[10px] mt-0.5 uppercase tracking-wider font-bold ${isAdmin ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isAdmin ? 'Portal Admin' : 'Portal Peserta'}
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-2">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isAdmin
                        ? isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        : isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? (isAdmin ? 'text-emerald-400' : 'text-emerald-600') : (isAdmin ? 'text-slate-400' : 'text-slate-400')}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className={`h-6 w-px mx-2 ${isAdmin ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors ${isAdmin ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
              >
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border border-slate-300 shrink-0">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div className="hidden lg:block text-left max-w-[150px]">
                  <p className={`text-sm font-semibold leading-none truncate ${isAdmin ? 'text-white' : 'text-slate-800'}`}>
                    {userName}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`} />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                    <p className="text-xs text-slate-500 capitalize">{userRole.replace('_', ' ')}</p>
                  </div>
                  
                  <Link 
                    href={settingsPath}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-emerald-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Pengaturan Profil
                  </Link>
                  
                  <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors">
                    <LogOut className="w-4 h-4" /> Keluar Aplikasi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 -mr-2 rounded-lg ${isAdmin ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden absolute top-full left-0 right-0 shadow-lg animate-in slide-in-from-top-2 ${isAdmin ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-100'}`}>
            <nav className="p-4 space-y-1">
              {navLinks.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isAdmin
                        ? isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
                        : isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? (isAdmin ? 'text-emerald-400' : 'text-emerald-600') : (isAdmin ? 'text-slate-500' : 'text-slate-400')}`} />
                    {item.name}
                  </Link>
                )
              })}
              
              <div className={`border-t my-2 pt-2 ${isAdmin ? 'border-slate-800' : 'border-slate-100'}`}></div>
              
              <div className="px-3 py-2 flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${isAdmin ? 'text-white' : 'text-slate-800'}`}>{userName}</p>
                  <p className={`text-xs capitalize truncate ${isAdmin ? 'text-slate-400' : 'text-slate-500'}`}>{userRole.replace('_', ' ')}</p>
                </div>
              </div>
              
              <Link 
                href={settingsPath}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isAdmin ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Settings className="w-5 h-5" /> Pengaturan Profil
              </Link>
              
              <button onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/login' }); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${isAdmin ? 'text-rose-400 hover:bg-slate-800' : 'text-rose-600 hover:bg-rose-50'}`}>
                <LogOut className="w-5 h-5" /> Keluar Aplikasi
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* ─ Main Content ─ */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
