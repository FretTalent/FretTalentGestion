/**
 * Helper client pour enregistrer le Service Worker et s'abonner aux notifications Push PWA
 */

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerPushSubscription(userId, role = 'candidate') {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push Notifications non supportées par ce navigateur.');
    return { success: false, reason: 'unsupported' };
  }

  try {
    // 1. Demander la permission de notification au navigateur / smartphone
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permission notification refusée par l\'utilisateur.');
      return { success: false, reason: 'permission_denied' };
    }

    // 2. Récupérer l'enregistrement du Service Worker
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.warn('Service Worker non prêt.');
      return { success: false, reason: 'sw_not_ready' };
    }

    // 3. Obtenir ou créer l'abonnement Push VAPID
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMe5H-lJ0x8UqV5J_q-oVzM47yT2N90jK5k_x9p3z9P9Z';
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 4. Enregistrer l'abonnement push dans Supabase via l'API
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: userId,
        role: role,
      }),
    });

    if (!res.ok) {
      throw new Error('Erreur enregistrement serveur abonnement push');
    }

    console.log('📱 Abonnement Push Mobile enregistré avec succès pour l\'utilisateur:', userId);
    return { success: true };
  } catch (err) {
    console.error('Erreur registerPushSubscription:', err);
    return { success: false, error: err.message };
  }
}
