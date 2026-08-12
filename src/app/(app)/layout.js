'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  Truck,
  Search,
  Briefcase,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Building2,
  Shield,
  Menu,
  ChevronRight,
  Mail,
  FileText,
  CreditCard,
} from 'lucide-react';

const navCandidate = [
  { href: '/dashboard/candidate', icon: Settings, label: 'Mon profil' },
  {
    href: '/dashboard/candidate/documents',
    icon: FileText,
    label: 'Mes documents',
  },
];
const navRecruiter = [
  { href: '/dashboard/recruiter', icon: Search, label: 'Recherche' },
  { href: '/dashboard/recruiter/jobs', icon: Briefcase, label: 'Mes offres' },
  { href: '/dashboard/recruiter/settings', icon: Settings, label: 'Paramètres' },
];
const navAdmin = [
  { href: '/dashboard/admin', icon: BarChart3, label: 'Tableau de bord' },
  { href: '/dashboard/admin/finance', icon: CreditCard, label: 'Finances & Stripe' },
  {
    href: '/dashboard/admin/jobs',
    icon: Briefcase,
    label: 'Modération annonces',
  },
  { href: '/dashboard/admin/candidates', icon: Users, label: 'Candidats' },
  { href: '/dashboard/admin/companies', icon: Building2, label: 'Entreprises' },
  { href: '/dashboard/admin/mail', icon: Mail, label: 'Gestion mails' },
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserEmail(user.email);

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setRole(profile.role);

        if (profile.role === 'recruiter') {
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', user.id)
            .single();
          if (company) setCompanyName(company.name);
        }
      }
    };
    fetchUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems =
    role === 'admin'
      ? navAdmin
      : role === 'recruiter'
        ? navRecruiter
        : navCandidate;

  const roleLabel =
    role === 'admin'
      ? 'Administrateur'
      : role === 'recruiter'
        ? 'Recruteur'
        : 'Chauffeur';

  const displayName =
    role === 'recruiter' && companyName ? companyName : userEmail;

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile ? 'flex' : 'hidden lg:flex'
      } flex-col w-64 bg-slate-900 text-white min-h-screen fixed top-0 left-0 z-40 shadow-2xl`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 border-b border-slate-700/60">
        <Link href="/">
          <img src="/logo.png" alt="FretTalent" className="h-10 md:h-12 w-auto object-contain brightness-0 invert" />
        </Link>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User badge */}
      <div className="px-4 py-4 border-b border-slate-700/60">
        <div className="bg-slate-800 rounded-2xl p-3 space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                role === 'admin'
                  ? 'bg-purple-400'
                  : role === 'recruiter'
                    ? 'bg-blue-400'
                    : 'bg-orange-400'
              }`}
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {roleLabel}
            </span>
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {displayName}
          </p>
          {role === 'recruiter' && companyName && (
            <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-orange-400'}`}
              />
              {item.label}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 opacity-70" />
              )}
            </Link>
          );
        })}

        {/* Lien retour au site */}
        <div className="pt-4 mt-4 border-t border-slate-700/60">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
          >
            <Truck className="h-5 w-5 text-slate-500 group-hover:text-orange-400" />
            Retour au site
          </Link>
        </div>
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-4 border-t border-slate-700/60">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut className="h-5 w-5 text-slate-500 group-hover:text-red-400" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar mobile (drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
          <Sidebar mobile />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg">
              <Truck className="h-4 w-4" />
            </div>
            <span className="text-lg font-extrabold text-slate-900 tracking-tight">
              Fret<span className="text-orange-500">Talent</span>
            </span>
          </div>
          <div className="ml-auto">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                role === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : role === 'recruiter'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
              }`}
            >
              {roleLabel}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
