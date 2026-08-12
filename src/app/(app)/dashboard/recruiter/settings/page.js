'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Save,
  RefreshCw,
  Building2,
  CreditCard,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import toast from 'react-hot-toast';

export default function RecruiterSettings() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [profile, setProfile] = useState(null);
  const [company, setCompany] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [siret, setSiret] = useState('');
  const [addressInfo, setAddressInfo] = useState({ address: '', postalCode: '', city: '' });
  const [subscriptionPlan, setSubscriptionPlan] = useState('pay_per_unlock');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }
      setUserEmail(user.email);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!profileData || profileData.role !== 'recruiter') {
        router.push('/');
        return;
      }
      setProfile(profileData);

      const { data: compData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.id)
        .single();

      if (compData) {
        setCompany(compData);
        setName(compData.name || '');
        setSiret(compData.siret || '');
        setAddressInfo({
          address: compData.address || '',
          postalCode: compData.postal_code || '',
          city: compData.city || '',
          fullLabel: compData.address ? `${compData.address} ${compData.postal_code} ${compData.city}` : `${compData.postal_code || ''} ${compData.city || ''}`
        });
        setSubscriptionPlan(compData.subscription_plan || 'pay_per_unlock');
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
        .from('companies')
        .update({
          name,
          siret,
          address: addressInfo.address,
          postal_code: addressInfo.postalCode,
          city: addressInfo.city,
          updated_at: new Date()
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Paramètres mis à jour avec succès !' });
      toast.success('Paramètres enregistrés');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la sauvegarde.' });
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleStripeCheckout = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ plan: subscriptionPlan }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Redirect to Stripe
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la connexion à Stripe');
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <p className="text-sm font-semibold text-center">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Informations Entreprise */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-500" /> Mon Entreprise
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Numéro SIRET *
              </label>
              <input
                type="text"
                required
                value={siret}
                onChange={e => setSiret(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                placeholder="14 chiffres"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Adresse complète *
              </label>
              <AddressAutocomplete 
                initialValue={addressInfo.fullLabel || addressInfo.city}
                onAddressSelect={setAddressInfo}
                required={true}
              />
            </div>
          </div>
        </div>

        {/* Facturation & Abonnement */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" /> Facturation & Abonnement
          </h2>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Mode de facturation
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option 1 : Paiement à l'acte */}
              <div 
                onClick={() => setSubscriptionPlan('pay_per_unlock')}
                className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex flex-col ${
                  subscriptionPlan === 'pay_per_unlock' 
                  ? 'border-orange-500 bg-orange-50/50' 
                  : 'border-slate-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900">Paiement à l'acte</h3>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    subscriptionPlan === 'pay_per_unlock' ? 'border-orange-500' : 'border-slate-300'
                  }`}>
                    {subscriptionPlan === 'pay_per_unlock' && <div className="h-2 w-2 bg-orange-500 rounded-full" />}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-2">2€ <span className="text-sm text-slate-500 font-normal">/ contact</span></div>
                <p className="text-xs text-slate-600 mt-auto">
                  Débloquez les coordonnées et les documents des candidats un par un au fil de vos besoins.
                </p>
              </div>

              {/* Option 2 : Abonnement Premium Pro */}
              <div 
                onClick={() => setSubscriptionPlan('premium_monthly')}
                className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex flex-col ${
                  subscriptionPlan === 'premium_monthly' 
                  ? 'border-orange-500 bg-orange-50/50' 
                  : 'border-slate-200 bg-white hover:border-orange-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 flex flex-col gap-1">
                    <span>Forfait Pro</span>
                    <span className="bg-orange-100 text-orange-600 text-[10px] w-fit uppercase px-2 py-0.5 rounded-full">Illimité</span>
                  </h3>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    subscriptionPlan === 'premium_monthly' ? 'border-orange-500' : 'border-slate-300'
                  }`}>
                    {subscriptionPlan === 'premium_monthly' && <div className="h-2 w-2 bg-orange-500 rounded-full" />}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-2">39,99€ <span className="text-sm text-slate-500 font-normal">/ mois</span></div>
                <p className="text-xs text-slate-600 mt-auto">
                  Accès illimité aux profils, documents officiels, et publication d'offres sans limites.
                </p>
              </div>

              {/* Option 3 : Abonnement Premium Plus */}
              <div 
                onClick={() => setSubscriptionPlan('premium_plus_monthly')}
                className={`cursor-pointer border-2 rounded-2xl p-4 transition-all flex flex-col ${
                  subscriptionPlan === 'premium_plus_monthly' 
                  ? 'border-slate-900 bg-slate-50' 
                  : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 flex flex-col gap-1">
                    <span>Premium Plus</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] w-fit uppercase px-2 py-0.5 rounded-full">Intégral</span>
                  </h3>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                    subscriptionPlan === 'premium_plus_monthly' ? 'border-slate-900' : 'border-slate-300'
                  }`}>
                    {subscriptionPlan === 'premium_plus_monthly' && <div className="h-2 w-2 bg-slate-900 rounded-full" />}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-2">54,99€ <span className="text-sm text-slate-500 font-normal">/ mois</span></div>
                <p className="text-xs text-slate-600 mt-auto">
                  Idéal pour la marque employeur : article dédié, logo en une, et support prioritaire.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Moyen de paiement</h3>
            {company?.has_payment_method && company?.subscription_plan === subscriptionPlan ? (
              <div className="flex items-center gap-3 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {company.subscription_plan === 'pay_per_unlock' 
                    ? 'Carte bancaire enregistrée (Prêt pour le paiement à l\'acte)' 
                    : 'Abonnement actif'}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-slate-50 text-slate-600 p-4 rounded-xl text-xs flex gap-2 border border-slate-200">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0 text-slate-400" />
                  Vous allez être redirigé vers l'interface sécurisée de Stripe pour valider ce choix.
                </div>
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  disabled={saving}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  {saving ? 'Redirection Stripe...' : (subscriptionPlan === 'pay_per_unlock' ? 'Enregistrer ma carte via Stripe' : 'S\'abonner via Stripe')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Paramètres de compte */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-orange-500" /> Compte & Sécurité
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Adresse e-mail
            </label>
            <input
              type="email"
              disabled
              value={userEmail}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">L'adresse e-mail ne peut pas être modifiée pour des raisons de sécurité.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
          >
            {saving ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}
