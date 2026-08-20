'use client';

import { useState, useEffect } from 'react';
import { Smartphone, Download, Check, Share, PlusSquare, X, Sparkles, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PwaInstallPrompt({ inline = false }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en standalone (app installée)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Détection iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Événement avant installation Chrome/Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Événement app installée
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setDeferredPrompt(null);
      toast.success('FretTalent a été installé sur votre écran d\'accueil ! 🎉');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success('Installation en cours...');
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      toast.error("Pour installer l'application, utilisez Chrome, Safari ou Samsung Internet sur votre mobile.");
    }
  };

  if (isStandalone || installed) {
    return null; // Déjà installée
  }

  // Version intégrée dans une carte (Inline Card)
  if (inline) {
    return (
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl space-y-5">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>App Mobile Candidat</span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
            100% Gratuit
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-white tracking-tight">
            Installez FretTalent sur votre téléphone
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Accédez à votre espace candidat en 1 clic et recevez les <strong>notifications push directes</strong> quand une entreprise débloque votre CV ou vous propose un poste !
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={handleInstallClick}
            className="btn-primary w-full sm:w-auto text-xs py-3.5 shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Installer l&apos;application en 1 clic</span>
          </button>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-400 justify-center">
            <Bell className="w-3.5 h-3.5 text-orange-400" />
            <span>Alerte sonore et vibreur direct</span>
          </div>
        </div>

        {/* Modal d'instructions iOS */}
        {showIosModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black">Installation sur iPhone (Safari)</h4>
                <p className="text-xs text-slate-500">Suivez ces 2 étapes simples pour ajouter l&apos;app à votre écran d&apos;accueil :</p>
              </div>

              <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Appuyez sur le bouton <strong>Partager</strong> en bas de Safari (<Share className="w-3.5 h-3.5 inline text-blue-600" />)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Faites défiler puis choisissez <strong>Sur l&apos;écran d&apos;accueil</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />)</span>
                </div>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                J&apos;ai compris
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Floating prompt banner
  return (
    <>
      {showIosModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-black">Installation sur iPhone / iPad</h4>
              <p className="text-xs text-slate-500">Ajoutez FretTalent sur votre écran d&apos;accueil en 2 clics :</p>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0">1</span>
                <span>Appuyez sur le bouton <strong>Partager</strong> (<Share className="w-3.5 h-3.5 inline text-blue-600" />)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center shrink-0">2</span>
                <span>Sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />)</span>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="w-full py-3 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
}
