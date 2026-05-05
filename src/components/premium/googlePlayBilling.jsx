// Stub für Google Play Billing.
// Der echte Kauf-Flow wird später angebunden (Android-App via Google Play Billing Library).
// Diese Datei stellt sicher, dass der UI-Flow vorbereitet ist.

export const GOOGLE_PLAY_PRODUCT_IDS = {
  basic: 'catchgbt_basic_monthly',
  pro: 'catchgbt_pro_monthly',
  elite: 'catchgbt_ultimate_monthly',
  friends: 'catchgbt_friends_yearly',
  friends_monthly: 'catchgbt_friends_monthly'
};

// Erkennt, ob die App in einer Android-WebView läuft, die Google Play Billing
// per JavaScript-Bridge bereitstellt. Wenn nicht (z.B. Web-Browser, iOS),
// ist der Kauf nicht möglich.
export function isGooglePlayBillingAvailable() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.AndroidBilling && typeof window.AndroidBilling.purchase === 'function');
}

// Stub-Kauf. Im echten Android-Build ruft window.AndroidBilling.purchase(productId)
// die Play Billing Library auf. Hier wird nur ein Hinweis ausgelöst.
export async function startGooglePlayPurchase(planId) {
  const productId = GOOGLE_PLAY_PRODUCT_IDS[planId];

  if (!productId) {
    return { success: false, error: 'Kein Google Play Produkt für diesen Plan hinterlegt.' };
  }

  if (isGooglePlayBillingAvailable()) {
    try {
      // Echter Aufruf an die native Bridge (wird später angebunden)
      window.AndroidBilling.purchase(productId);
      return { success: true, pending: true };
    } catch (e) {
      return { success: false, error: e?.message || 'Google Play Billing Fehler' };
    }
  }

  // Kein Android-Build: Kauf nicht möglich.
  return {
    success: false,
    error: 'Käufe sind nur in der Android-App über den Google Play Store möglich. Bitte lade die App aus dem Play Store.'
  };
}