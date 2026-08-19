'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import {
  Truck,
  Search,
  Briefcase,
  Settings,
  LogOut,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  Menu,
  ChevronRight,
  Mail,
  FileText,
  CreditCard,
  X,
  MessageSquare,
  Send,
  Zap,
  Bell,
  ExternalLink,
  ShieldCheck,
  LayoutDashboard,
  Layers,
  ChevronDown,
} from 'lucide-react';

const navCandidate = [
  { href: '/dashboard/candidate', icon: Truck, label: 'Mon profil' },
  {
    href: '/dashboard/candidate/documents',
    icon: FileText,
    label: 'Mes documents',
  },
  {
    href: '/dashboard/candidate/support',
    icon: MessageSquare,
    label: 'Support',
  },
];

const navRecruiter = [
  { href: '/dashboard/recruiter', icon: Search, label: 'Recherche' },
  { href: '/dashboard/recruiter/jobs', icon: Briefcase, label: 'Mes offres' },
  { href: '/dashboard/recruiter/settings', icon: Settings, label: 'Paramètres' },
  { href: '/dashboard/recruiter/support', icon: MessageSquare, label: 'Support' },
];

const navAdminHorizontal = [
  { href: '/dashboard/admin', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/admin/stats', icon: TrendingUp, label: 'Statistiques site' },
  { href: '/dashboard/admin/finance', icon: CreditCard, label: 'Finances & Stripe' },
  { href: '/dashboard/admin/candidates', icon: Users, label: 'Candidats', badgeKey: 'pendingCandidates', badgeColor: '#E53935' },
  { href: '/dashboard/admin/companies', icon: Building2, label: 'Entreprises' },
  { href: '/dashboard/admin/jobs', icon: Briefcase, label: 'Modération annonces', badgeKey: 'pendingJobs', badgeColor: '#FF7A00' },
  { href: '/dashboard/admin/chat', icon: MessageSquare, label: 'Support', badgeKey: 'openSupport', badgeColor: '#43A047' },
  { href: '/dashboard/admin/mail', icon: Mail, label: 'Gestion mails' },
];

// Breadcrumb mapping
const breadcrumbMap = {
  '/dashboard/admin': 'Tableau de bord',
  '/dashboard/admin/stats': 'Statistiques site',
  '/dashboard/admin/finance': 'Finances & Stripe',
  '/dashboard/admin/candidates': 'Candidats',
  '/dashboard/admin/companies': 'Entreprises',
  '/dashboard/admin/jobs': 'Modération annonces',
  '/dashboard/admin/chat': 'Support & Tchat',
  '/dashboard/admin/mail': 'Gestion mails',
  '/dashboard/admin/users': 'Utilisateurs',
  '/dashboard/candidate': 'Mon profil',
  '/dashboard/candidate/documents': 'Mes documents',
  '/dashboard/candidate/support': 'Support',
  '/dashboard/recruiter': 'Recherche',
  '/dashboard/recruiter/jobs': 'Mes offres',
  '/dashboard/recruiter/settings': 'Paramètres',
  '/dashboard/recruiter/support': 'Support',
};

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [adminCounts, setAdminCounts] = useState({
    pendingCandidates: 0,
    pendingJobs: 0,
    openSupport: 0,
  });

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
        .maybeSingle();

      if (profile) {
        setRole(profile.role);

        if (profile.role === 'recruiter') {
          const { data: company } = await supabase
            .from('companies')
            .select('name')
            .eq('id', user.id)
            .maybeSingle();
          if (company) setCompanyName(company.name);
        } else if (profile.role === 'admin') {
          try {
            const [candRes, jobsRes, convsRes] = await Promise.all([
              supabase.from('candidates').select('id, validated', { count: 'exact' }).eq('validated', false),
              supabase.from('jobs').select('id, is_approved', { count: 'exact' }).eq('is_approved', false),
              supabase.from('support_conversations').select('id, status', { count: 'exact' }).eq('status', 'open'),
            ]);
            setAdminCounts({
              pendingCandidates: candRes.count || 0,
              pendingJobs: jobsRes.count || 0,
              openSupport: convsRes.count || 0,
            });
          } catch (e) {
            console.error('Error fetching admin counts', e);
          }
        }
      } else {
        setRole('candidate');
      }
    };
    fetchUser();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const roleLabel =
    role === 'admin'
      ? 'Super Admin'
      : role === 'recruiter'
        ? 'Recruteur'
        : 'Chauffeur';

  const displayName =
    role === 'recruiter' && companyName ? companyName : userEmail;

  const isAdmin = role === 'admin' || pathname?.startsWith('/dashboard/admin');

  // ==========================================
  // 1. LAYOUT ADMIN : FULL-WIDTH & HEADER TOP
  // ==========================================
  if (isAdmin) {
    return (
      <div className="min-h-screen font-sans flex flex-col" style={{ background: '#F8FAFC' }}>
        {/* TOP HEADER ADMIN HORIZONTAL : PLEINE LARGEUR, DESIGN PRO & TRÈS LISIBLE */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-sm backdrop-blur-md bg-white/95 w-full">
          {/* Ligne 1 : Brand & Profil */}
          <div className="w-full px-4 sm:px-8 py-3 flex items-center justify-between gap-4 border-b border-slate-100">
            {/* Logo FretTalent */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard/admin" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#E56700] flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    Fret<span className="text-[#FF7A00]">Talent</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    Console Administration
                  </span>
                </div>
              </Link>
            </div>

            {/* Actions rapides droite */}
            <div className="flex items-center gap-3">
              {/* Badge En Direct */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>En direct</span>
              </div>

              {/* Lien Site Public */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Voir le site</span>
              </Link>

              {/* Profil & Déconnexion */}
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#E56700] text-white flex items-center justify-center font-black text-xs shadow-xs">
                  ⚡
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-black text-slate-900 leading-tight">Admin Master</span>
                  <span className="text-[11px] text-slate-500 font-bold truncate max-w-[140px]">{userEmail}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Se déconnecter"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Ligne 2 : Navigation Pleine Largeur (9 Onglets bien espacés, police agrandie, flex-wrap propre) */}
          <div className="w-full px-4 sm:px-8 py-2 bg-slate-50/60">
            <nav className="flex flex-wrap items-center gap-2">
              {navAdminHorizontal.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/dashboard/admin' && pathname.startsWith(item.href));
                const badgeCount = item.badgeKey ? adminCounts[item.badgeKey] : 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-black'
                        : 'text-slate-700 bg-white hover:text-slate-950 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black leading-none ${
                          isActive ? 'bg-white text-orange-600' : 'bg-red-500 text-white'
                        }`}
                      >
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>

        {/* CONTENU PRINCIPAL PLEINE LARGEUR & LISIBLE */}
        <main className="flex-1 w-full px-4 sm:px-8 py-6">
          {children}
        </main>

        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
      </div>
    );
  }

  // ==========================================
  // 2. LAYOUT CANDIDAT & RECRUTEUR (STANDARD)
  // ==========================================
  const navItems = role === 'recruiter' ? navRecruiter : navCandidate;
  const currentPageLabel = breadcrumbMap[pathname] || 'Dashboard';

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile ? 'flex' : 'hidden lg:flex'
      } flex-col w-64 min-h-screen fixed top-0 left-0 z-40 bg-[#0a0f1e] border-r border-white/10 shadow-2xl`}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="FretTalent" className="h-8 w-auto object-contain brightness-0 invert" />
        </Link>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 py-3 mx-3 my-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                {roleLabel}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate" title={displayName}>
              {displayName}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-grow px-3 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'text-white bg-orange-500/20 border-l-[3px] border-[#FF7A00] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-[#FF7A00]' : 'text-slate-400'}`} />
              <span className="truncate flex-1 min-w-0">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ExternalLink className="h-4 w-4 text-slate-400" />
            <span>Voir le site public</span>
          </Link>
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen font-sans flex bg-[#f4f6fb]">
      <Sidebar />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-slate-950/70 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
          <Sidebar mobile />
        </div>
      )}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-slate-100">
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <span className="text-lg font-extrabold text-slate-900 tracking-tight">
            Fret<span className="text-[#FF7A00]">Talent</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-orange-100 text-[#FF7A00]">
            {roleLabel}
          </span>
        </header>

        <header className="hidden lg:flex sticky top-0 z-20 items-center justify-between px-6 py-3 bg-white border-b border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="text-slate-400 font-medium">Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span>{currentPageLabel}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs">
              {displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-grow p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">{children}</main>
      </div>

      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </div>
  );
}


