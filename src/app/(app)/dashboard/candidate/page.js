"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Save, RefreshCw, Eye, EyeOff, UserCheck, ShieldAlert } from "lucide-react";
import CandidateDocuments from "@/components/CandidateDocuments";

export default function CandidateDashboard() {
  const router = useRouter();
  
  // États de profil
  const [profile, setProfile] = useState(null);
  const [candidate, setCandidate] = useState(null);
  
  // Formulaire d'édition de profil
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [mobilityRadius, setMobilityRadius] = useState(50);
  const [experienceYears, setExperienceYears] = useState(0);
  const [availability, setAvailability] = useState("immediate");
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [documents, setDocuments] = useState({});
  
  // Listes multi-sélection
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  const [selectedCertifications, setSelectedCertifications] = useState([]);
  const [selectedContractTypes, setSelectedContractTypes] = useState([]);
  const [isActive, setIsActive] = useState(true);

  // Historique des déblocages
  const [unlocks, setUnlocks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const licensesOptions = ["B", "C", "CE", "PL", "SPL"];
  const certificationsOptions = ["FIMO", "FCO", "ADR de base", "ADR Citerne", "ADR Explosifs", "Carte Chrono"];
  const contractOptions = ["CDI", "CDD", "Intérim", "Temps partiel"];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push("/login");
        return;
      }

      // Charger le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileError || profileData?.role !== "candidate") {
        router.push("/");
        return;
      }

      setProfile(profileData);

      // Charger les détails du candidat
      const { data: candidateData, error: candidateError } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", user.id)
        .single();

      if (candidateData) {
        setCandidate(candidateData);
        setFullName(candidateData.full_name || "");
        setPhone(candidateData.phone || "");
        setPostalCode(candidateData.postal_code || "");
        setCity(candidateData.city || "");
        setMobilityRadius(candidateData.mobility_radius || 50);
        setExperienceYears(candidateData.experience_years || 0);
        setAvailability(candidateData.availability || "immediate");
        setAvailabilityDate(candidateData.availability_date || "");
        setSelectedLicenses(candidateData.licenses || []);
        setSelectedCertifications(candidateData.certifications || []);
        setSelectedContractTypes(candidateData.contract_types || []);
        setIsActive(candidateData.is_active ?? true);
        setDocuments(candidateData.documents || {});
      }

      // Charger l'historique des déblocages de son contact
      const { data: unlocksData, error: unlocksError } = await supabase
        .from("unlocks")
        .select("unlocked_at, company_id, companies (name)")
        .eq("candidate_id", user.id);

      if (!unlocksError && unlocksData) {
        setUnlocks(unlocksData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("candidates")
        .update({
          full_name: fullName,
          phone: phone,
          postal_code: postalCode,
          city: city,
          mobility_radius: parseInt(mobilityRadius),
          experience_years: parseInt(experienceYears),
          availability,
          availability_date: availability === "specific_date" ? availabilityDate : null,
          licenses: selectedLicenses,
          certifications: selectedCertifications,
          contract_types: selectedContractTypes,
          is_active: isActive,
          updated_at: new Date()
        })
        .eq("id", profile.id);

      if (error) throw error;
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Erreur de mise à jour du profil." });
    } finally {
      setSaving(false);
    }
  };

  const toggleMultiSelect = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

        {/* Message Status */}
        {message && (
          <div className={`p-4 rounded-xl border ${
            message.type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          }`}>
            <p className="text-sm font-semibold text-center">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-500" /> Mon Profil Professionnel
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Téléphone portable</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Code postal</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Ville</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              {/* Expérience et disponibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Années d'expérience</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Rayon de mobilité (km)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={10}
                      max={200}
                      step={10}
                      value={mobilityRadius}
                      onChange={(e) => setMobilityRadius(e.target.value)}
                      className="w-full accent-orange-500"
                    />
                    <span className="text-sm font-bold text-slate-900 w-16">{mobilityRadius} km</span>
                  </div>
                </div>
              </div>

              {/* Disponibilité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">Disponibilité</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                  >
                    <option value="immediate">Immédiate</option>
                    <option value="notice">Avec préavis</option>
                    <option value="specific_date">À une date précise</option>
                  </select>
                </div>
                {availability === "specific_date" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Date de disponibilité</label>
                    <input
                      type="date"
                      value={availabilityDate}
                      onChange={(e) => setAvailabilityDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                )}
              </div>

              {/* Permis de conduire */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase block">Permis détenus</label>
                <div className="flex flex-wrap gap-2">
                  {licensesOptions.map((license) => {
                    const isSelected = selectedLicenses.includes(license);
                    return (
                      <button
                        key={license}
                        type="button"
                        onClick={() => toggleMultiSelect(license, selectedLicenses, setSelectedLicenses)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected 
                            ? "bg-orange-500 text-white border-orange-500" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {license}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Certifications / Habilitations */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase block">Habilitations & Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {certificationsOptions.map((cert) => {
                    const isSelected = selectedCertifications.includes(cert);
                    return (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => toggleMultiSelect(cert, selectedCertifications, setSelectedCertifications)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected 
                            ? "bg-orange-500 text-white border-orange-500" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {cert}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contrats recherchés */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase block">Types de contrats recherchés</label>
                <div className="flex flex-wrap gap-2">
                  {contractOptions.map((contract) => {
                    const isSelected = selectedContractTypes.includes(contract);
                    return (
                      <button
                        key={contract}
                        type="button"
                        onClick={() => toggleMultiSelect(contract, selectedContractTypes, setSelectedContractTypes)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
                          isSelected 
                            ? "bg-orange-500 text-white border-orange-500" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {contract}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Save className="h-4 w-4" /> {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </button>
              </div>
            </form>

            <CandidateDocuments 
              candidateId={profile?.id} 
              documents={documents} 
              onUpdate={(newDocs) => setDocuments(newDocs)} 
            />
          </div>

          {/* Widgets de confidentialité & Historique */}
          <div className="space-y-6">
            {/* Statut de visibilité */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Statut de visibilité</h3>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  {isActive ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isActive ? "Visible sur la carte" : "Masqué"}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {isActive ? "Les recruteurs peuvent vous voir" : "Vous n'apparaissez plus"}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors ${
                    isActive 
                      ? "bg-slate-200 text-slate-700 hover:bg-slate-350" 
                      : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
                >
                  {isActive ? "Désactiver" : "Activer"}
                </button>
              </div>
              <div className="bg-orange-50 text-orange-800 p-3 rounded-xl flex items-start gap-2 text-xs">
                <ShieldAlert className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>En masquant votre profil, aucune entreprise ne pourra initier de nouveau déblocage de contact.</span>
              </div>
            </div>

            {/* Historique des entreprises */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Entreprises intéressées ({unlocks.length})</h3>
              {unlocks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Aucune entreprise n'a encore débloqué votre contact.</p>
              ) : (
                <div className="space-y-3">
                  {unlocks.map((unlock, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-900">{unlock.companies?.name || "Entreprise Anonyme"}</span>
                      <span className="text-[10px] text-slate-400">Débloqué le {new Date(unlock.unlocked_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
