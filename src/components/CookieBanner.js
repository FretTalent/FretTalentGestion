"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("frettalent_cookie_consent");
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("frettalent_cookie_consent", "accepted");
    setIsOpen(false);
  };

  const declineAll = () => {
    localStorage.setItem("frettalent_cookie_consent", "declined");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-slate-900/95 text-white shadow-2xl border-t border-slate-800 backdrop-blur-md transition-transform duration-300">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-semibold text-sm">Gestion des cookies et vie privée</p>
          <p className="text-xs text-slate-300">
            FretTalent utilise des cookies pour assurer le bon fonctionnement du site et mesurer notre audience.
            Consultez notre{" "}
            <Link href="/legal/cookies" className="underline text-orange-400 hover:text-orange-300">
              politique de cookies
            </Link>{" "}
            pour en savoir plus.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto justify-end">
          <button
            onClick={declineAll}
            className="px-4 py-2 text-xs font-semibold bg-transparent hover:bg-slate-850 border border-slate-700 hover:border-slate-500 rounded-md transition-colors w-1/2 md:w-auto"
          >
            Refuser tout
          </button>
          <button
            onClick={acceptAll}
            className="px-4 py-2 text-xs font-semibold bg-orange-500 hover:bg-orange-600 rounded-md transition-colors w-1/2 md:w-auto"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
