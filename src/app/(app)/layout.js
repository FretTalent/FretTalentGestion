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
  Shield,
  Menu,
  ChevronRight,
  Mail,
  FileText,
  CreditCard,
  X,
  MessageSquare,
  Send,
  ExternalLink,
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
const navAdmin = [
  { section: 'Pilotage' },
  { href: '/dashboard/admin', icon: BarChart3, label: 'Tableau de bord' },
  { href: '/dashboard/admin/stats', icon: TrendingUp, label: 'Statistiques site' },
  { href: '/dashboard/admin/finance', icon: CreditCard, label: 'Finances & Stripe' },
  { section: 'Auto-Candidatures (19,99 €)' },
  { href: '/dashboard/admin/premium', icon: Send, label: 'Auto-Candidatures' },
  { section: 'Données & Modération' },
  { href: '/dashboard/admin/candidates', icon: Users, label: 'Candidats' },
  { href: '/dashboard/admin/companies', icon: Building2, label: 'Entreprises' },
  { href: '/dashboard/admin/jobs', icon: Briefcase, label: 'Modération annonces' },
  { section: 'Support & Outils' },
  { href: '/dashboard/admin/chat', icon: MessageSquare, label: 'Tchat Support' },
  { href: '/dashboard/admin/mail', icon: Mail, label: 'Gestion mails' },
];

// Breadcrumb mapping
const breadcrumbMap = {
  '/dashboard/admin': 'Tableau de bord',
  '/dashboard/admin/stats': 'Statistiques site',
  '/dashboard/admin/finance': 'Finances & Stripe',
  '/dashboard/admin/premium': 'Auto-Candidatures 19,99 €',
  '/dashboard/admin/candidates': 'Candidats',
  '/dashboard/admin/companies': 'Entreprises',
  '/dashboard/admin/jobs': 'Modération annonces',
  '/dashboard/admin/chat': 'Tchat Support',
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

// Avatar gradient based on first char
const avatarColors = [
  'from-orange-500 to-amber-500',
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-rose-500 to-pink-500',
];

export default function AppLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
          // Fetch live counts for badges
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

  const avatarInitial =
    role === 'admin' ? '⚡' : (displayName?.charAt(0)?.toUpperCase() || 'U');
  const avatarGradient = avatarColors[(displayName?.charCodeAt(0) || 0) % avatarColors.length];

  // Current page breadcrumb
  const currentPageLabel = breadcrumbMap[pathname] || (pathname?.includes('/candidates/') ? 'Dossier Candidat' : 'Dashboard');
  const isAdminPage = pathname?.startsWith('/dashboard/admin');

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile ? 'flex' : 'hidden lg:flex'
      } flex-col w-64 min-h-screen fixed top-0 left-0 z-40`}
      style={{ background: '#0a0f1e', borderRight: '1px solid rgba(255,255,255,0.06)', boxShadow: '4px 0 24px rgba(0,0,0,0.15)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="FretTalent" className="h-8 w-auto object-contain brightness-0 invert" />
          {role === 'admin' && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(249,115,22,0.15)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}
            >
              Admin
            </span>
          )}
        </Link>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b' }}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* User badge */}
      <div className="px-3 py-3 mx-3 my-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-sm shrink-0`}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            {avatarInitial}
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

      {/* Navigation */}
      <nav className="flex-grow px-3 py-1 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div
                key={`sec-${index}`}
                className="pt-5 pb-1.5 px-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-slate-300"
              >
                <span>{item.section}</span>
                <span className="flex-1 h-[1px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;

          // Badges for admin
          let badge = null;
          if (role === 'admin') {
            if (item.href === '/dashboard/admin/candidates' && adminCounts.pendingCandidates > 0) {
              badge = { count: adminCounts.pendingCandidates, bg: '#f97316' };
            } else if (item.href === '/dashboard/admin/jobs' && adminCounts.pendingJobs > 0) {
              badge = { count: adminCounts.pendingJobs, bg: '#f59e0b' };
            } else if (item.href === '/dashboard/admin/chat' && adminCounts.openSupport > 0) {
              badge = { count: adminCounts.openSupport, bg: '#10b981' };
            }
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'text-white bg-orange-500/15 border-l-[3px] border-orange-500 font-bold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  isActive ? 'text-orange-400' : 'text-slate-300 group-hover:text-white'
                }`}
              />
              <span className="truncate flex-1 min-w-0">{item.label}</span>
              {badge && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 min-w-[18px] text-center text-white shadow-xs"
                  style={{ background: badge.bg }}
                >
                  {badge.count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Lien retour au site */}
        <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all group"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-orange-400 transition-colors" />
            <span className="truncate flex-1 min-w-0">Voir le site public</span>
          </Link>
        </div>
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-red-300 hover:bg-red-500/15 transition-all group"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-slate-400 group-hover:text-red-400 transition-colors" />
          <span className="truncate flex-1 text-left">Se déconnecter</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen font-sans flex" style={{ background: '#f4f6fb' }}>
      {/* Sidebar desktop */}
      <Sidebar />

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(4px)' }}
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
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen min-w-0 max-w-full overflow-x-hidden">

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

        {/* Desktop Topbar avec breadcrumb */}
        <header
          className="hidden lg:flex sticky top-0 z-20 items-center justify-between px-6 py-3 border-b"
          style={{ background: '#ffffff', borderColor: '#e8ecf4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium" style={{ color: '#94a3b8' }}>Dashboard</span>
            <ChevronRight className="h-3.5 w-3.5" style={{ color: '#cbd5e1' }} />
            {isAdminPage && (
              <>
                <span className="font-medium" style={{ color: '#94a3b8' }}>Admin</span>
                <ChevronRight className="h-3.5 w-3.5" style={{ color: '#cbd5e1' }} />
              </>
            )}
            <span className="font-semibold text-slate-800">{currentPageLabel}</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.08)', color: '#059669', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>En direct</span>
            </div>

            {/* Notifications bell (admin only) */}
            {role === 'admin' && (adminCounts.pendingCandidates > 0 || adminCounts.openSupport > 0) && (
              <Link href="/dashboard/admin/candidates?status=pending" className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="h-4 w-4 text-slate-500" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[8px] font-black flex items-center justify-center">
                  {adminCounts.pendingCandidates + adminCounts.openSupport}
                </span>
              </Link>
            )}

            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-xs cursor-default`}
              title={displayName}
            >
              {avatarInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-grow p-3 sm:p-5 lg:p-6 min-w-0 max-w-full overflow-x-hidden">{children}</main>
      </div>

      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </div>
  );
}

