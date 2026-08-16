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
} from 'lucide-react';

const navCandidate = [
  { href: '/dashboard/candidate', icon: Settings, label: 'Mon profil' },
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
  { section: 'Données & Modération' },
  { href: '/dashboard/admin/candidates', icon: Users, label: 'Candidats' },
  { href: '/dashboard/admin/companies', icon: Building2, label: 'Entreprises' },
  { href: '/dashboard/admin/jobs', icon: Briefcase, label: 'Modération annonces' },
  { section: 'Support & Outils' },
  { href: '/dashboard/admin/chat', icon: MessageSquare, label: 'Tchat Support' },
  { href: '/dashboard/admin/mail', icon: Mail, label: 'Gestion mails' },
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
      ? 'Super Admin'
      : role === 'recruiter'
        ? 'Recruteur'
        : 'Chauffeur';

  const displayName =
    role === 'recruiter' && companyName ? companyName : userEmail;

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`${
        mobile ? 'flex' : 'hidden lg:flex'
      } flex-col w-64 bg-slate-950 text-white min-h-screen fixed top-0 left-0 z-40 border-r border-slate-800 shadow-2xl`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-950">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="FretTalent" className="h-8 md:h-9 w-auto object-contain brightness-0 invert" />
          {role === 'admin' && (
            <span className="text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded border border-orange-500/30">
              Console
            </span>
          )}
        </Link>
        {mobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User badge */}
      <div className="px-4 py-3.5 border-b border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
            {role === 'admin' ? '⚡' : displayName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                {roleLabel}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate">
              {displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item, index) => {
          if (item.section) {
            return (
              <div
                key={`sec-${index}`}
                className="pt-4 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-2"
              >
                <span>{item.section}</span>
                <span className="flex-1 h-[1px] bg-slate-800/60" />
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href;

          // Badges for admin
          let badge = null;
          if (role === 'admin') {
            if (item.href === '/dashboard/admin/candidates' && adminCounts.pendingCandidates > 0) {
              badge = { count: adminCounts.pendingCandidates, color: 'bg-orange-500 text-white' };
            } else if (item.href === '/dashboard/admin/jobs' && adminCounts.pendingJobs > 0) {
              badge = { count: adminCounts.pendingJobs, color: 'bg-amber-500 text-white' };
            } else if (item.href === '/dashboard/admin/chat' && adminCounts.openSupport > 0) {
              badge = { count: adminCounts.openSupport, color: 'bg-emerald-500 text-white' };
            }
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-slate-800 text-white border-l-2 border-orange-500 font-bold'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <Icon
                className={`h-4 w-4 flex-shrink-0 ${
                  isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />
              <span className="truncate flex-1 min-w-0">{item.label}</span>
              {badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${badge.color}`}>
                  {badge.count}
                </span>
              )}
            </Link>
          );
        })}

        {/* Lien retour au site */}
        <div className="pt-3 mt-3 border-t border-slate-800/80">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-all group"
          >
            <Truck className="h-4 w-4 text-slate-400 group-hover:text-orange-400 flex-shrink-0" />
            <span className="truncate flex-1 min-w-0">Voir le site public</span>
          </Link>
        </div>
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-3 border-t border-slate-800/80">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group"
        >
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-400 flex-shrink-0" />
          <span className="truncate flex-1 text-left">Se déconnecter</span>
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

      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
    </div>
  );
}
