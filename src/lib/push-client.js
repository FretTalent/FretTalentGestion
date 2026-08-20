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
  if (typeof window === 'undefined') {
    return { success: false, reason: 'server_side' };
  }

  // Détection iPhone / iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (isIOS && !isStandalone) {
    return {
      success: false,
      reason: 'ios_not_standalone',
      message: 'Sur iPhone (iOS), Apple exige que l\'application soit ajoutée à votre Écran d\'accueil. Appuyez sur le bouton Partager ⎋ puis "Sur l\'écran d\'accueil", et ouvrez l\'application depuis son icône.',
    };
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return {
      success: false,
      reason: 'unsupported',
      message: 'Votre navigateur mobile ne supporte pas les notifications Push web.',
    };
  }

  try {
    // Si la permission est déjà refusée/bloquée au niveau du navigateur
    if (Notification.permission === 'denied') {
      return {
        success: false,
        reason: 'permission_denied',
        message: 'Les notifications sont actuellement bloquées dans votre navigateur. Cliquez sur l\'icône de cadenas 🔒 à côté de l\'adresse web pour les autoriser.',
      };
    }

    // 1. Demander la permission de notification au navigateur / smartphone
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        reason: 'permission_denied',
        message: 'Permission refusée. Veuillez autoriser les notifications dans votre navigateur.',
      };
    }

    // 2. Récupérer l'enregistrement du Service Worker
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      return { success: false, reason: 'sw_not_ready', message: 'Service Worker non prêt.' };
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
    return { success: false, error: err.message, message: err.message };
  }
}
