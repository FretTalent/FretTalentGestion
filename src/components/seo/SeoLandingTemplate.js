'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Briefcase,
  Users,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Clock,
  FileText,
  Search,
  Check,
  X,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export default function SeoLandingTemplate({
  h1,
  subtitle,
  badgeText = "Recrutement & Emploi Transport Routier",
  sections = [],
  comparisonTable = null,
  keyTakeaways = [],
  faqs = [],
  jsonLd = [],
  relatedLinks = [],
}) {
  const [openFaq, setOpenFaq] = useState(null);

  const defaultRelatedLinks = [
    { title: "Chauffeur SPL", href: "/chauffeur-spl" },
    { title: "Chauffeur PL", href: "/chauffeur-pl" },
    { title: "Chauffeur ADR", href: "/chauffeur-adr" },
    { title: "Chauffeur Frigo", href: "/chauffeur-frigo" },
    { title: "Chauffeur Benne", href: "/chauffeur-benne" },
    { title: "Emploi Chauffeur", href: "/emploi-chauffeur" },
    { title: "Recrutement Transport", href: "/recrutement-transport" },
    { title: "Transporteurs France", href: "/transporteurs-france" },
    { title: "Transport Routier", href: "/transport-routier" },
    { title: "Messagerie & Distribution", href: "/messagerie" },
    { title: "Fret Express", href: "/fret-express" },
    { title: "Chauffeur SPL Hauts-de-France", href: "/chauffeur-spl-hauts-de-france" },
    { title: "Chauffeur SPL Aisne", href: "/chauffeur-spl-aisne" },
    { title: "Transporteurs Hauts-de-France", href: "/transporteurs-hauts-de-france" },
    { title: "Transporteurs Aisne", href: "/transporteurs-aisne" },
  ];

  const linksToDisplay = relatedLinks.length > 0 ? relatedLinks : defaultRelatedLinks;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* BALISAGE STRUCTURÉ JSON-LD */}
      {jsonLd && jsonLd.length > 0 && jsonLd.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* HERO SECTION HIGH-END */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-orange-50/50 via-white to-white border-b border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span>{badgeText}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-tight max-w-4xl mx-auto">
            {h1}
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* BOUTONS D'ACTION (CTA) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/offres"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              <span>Consulter les offres d'emploi</span>
            </Link>

            <Link
              href="/candidats-disponibles"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-sm shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5 text-orange-400" />
              <span>Voir les chauffeurs disponibles</span>
            </Link>
          </div>

          {/* BADGES RÉASSURANCE */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-700">
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              100% Gratuit Chauffeurs
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              Permis & Justificatifs Vérifiés
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-2xs">
              <Zap className="h-4 w-4 text-orange-500" />
              Recrutement Direct Sans Intermédiaire
            </span>
          </div>

        </div>
      </section>

      {/* RENTABILITÉ & CHIFFRES CLÉS */}
      <section className="py-12 bg-slate-900 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-orange-400 font-mono">100%</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Transport Routier</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">SPL / PL</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Permis & FIMO Vérifiés</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">0 €</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Commission d'Intérim</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-black text-blue-400 font-mono">France</p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Couverture Nationale</p>
          </div>
        </div>
      </section>

      {/* BLOC POINTS CLÉS À RETENIR (KEY TAKEAWAYS) */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <section className="pt-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-50/80 border border-orange-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-orange-800 font-black text-sm uppercase tracking-wider">
              <Award className="w-5 h-5 text-orange-500" />
              <span>Points Clés & Synthèse Légale</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-slate-800">
              {keyTakeaways.map((item, kIdx) => (
                <li key={kIdx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-orange-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CONTENU SEO DÉTAILLÉ (SECTIONS H2 / H3 / TEXTE 1000 - 1500 MOTS) */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {sections.map((section, sIdx) => (
          <article key={sIdx} className="space-y-6">
            
            {section.h2 && (
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight flex items-center gap-3 border-b border-slate-200 pb-3">
                <span className="w-2.5 h-8 bg-orange-500 rounded-full shrink-0" />
                <span>{section.h2}</span>
              </h2>
            )}

            {section.content && (
              <p className="text-base text-slate-700 leading-relaxed font-normal">
                {section.content}
              </p>
            )}

            {/* SUBSECTIONS H3 */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {section.subsections.map((sub, subIdx) => (
                  <div
                    key={subIdx}
                    className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3 hover:border-orange-200 transition-all hover:shadow-sm"
                  >
                    {sub.h3 && (
                      <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                        <span>{sub.h3}</span>
                      </h3>
                    )}
                    {sub.content && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {sub.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </article>
        ))}
      </section>

      {/* TABLEAU COMPARATIF DÉTAILLÉ (COMPARISON TABLE) */}
      {comparisonTable && (
        <section className="py-12 bg-slate-50 border-y border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3 py-1 rounded-full">
                Analyse Comparative
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                {comparisonTable.title}
              </h2>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    {comparisonTable.headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-5 py-4 font-black uppercase tracking-wider text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                  {comparisonTable.rows.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className={`px-5 py-4 ${cIdx === 0 ? 'font-bold text-slate-950' : ''}`}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* SECTION MAILLAGE INTERNE INTELLIGENT (SEO LINKS MESH) */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-950">
              Explorez nos métiers et opportunités de recrutement transport
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Découvrez nos guides et opportunités emploi pour chauffeurs poids lourds et transporteurs routiers en France.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {linksToDisplay.map((lnk, lIdx) => (
              <Link
                key={lIdx}
                href={lnk.href}
                className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:text-orange-600 hover:border-orange-300 transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs hover:scale-[1.02]"
              >
                <Truck className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="truncate">{lnk.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION FAQ (ACCORDION + SCHEMA JSON-LD) */}
      {faqs && faqs.length > 0 && (
        <section className="py-16 md:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
              Foire Aux Questions
            </span>
            <h2 className="text-3xl font-black text-slate-950">Questions Fréquentes</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, fIdx) => (
              <div
                key={fIdx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-all bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === fIdx ? null : fIdx)}
                  className="w-full px-6 py-4 text-left font-black text-sm sm:text-base text-slate-950 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  {openFaq === fIdx ? (
                    <ChevronUp className="w-5 h-5 text-orange-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === fIdx && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CALL TO ACTION FINAL */}
      <section className="py-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Prêt à recruter ou à trouver votre prochain poste ?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Rejoignez la 1ère plateforme spécialisée dans le transport routier en France. Inscrivez-vous gratuitement en moins de 2 minutes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register?role=candidate"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5" />
              <span>Chauffeur : Déposer mon CV</span>
            </Link>

            <Link
              href="/register?role=recruiter"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-sm shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5 text-orange-500" />
              <span>Transporteur : Espace Recruteur</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
