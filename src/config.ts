// ==============================================================================
// FAMCARE360: Public Application Configuration
// Path: src/config.ts
//
// These public values identify client API endpoints and public keys (Anon/VAPID).
// Secrets (such as Supabase service-role keys or Firebase service-account private
// keys) are NEVER placed here and belong exclusively in backend Edge Functions.
// ==============================================================================

export const APP_CONFIG = {
  supabase: {
    url:
      import.meta.env.VITE_SUPABASE_URL ||
      "https://ybclqcovxyqhehkprawr.supabase.co",
    publishableKey:
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      "sb_publishable_fXHo37Q-wao94eSsTZaPwA_QID-swCQ",
    projectId:
      import.meta.env.VITE_SUPABASE_PROJECT_ID || "ybclqcovxyqhehkprawr",
  },
  firebase: {
    apiKey:
      import.meta.env.VITE_FIREBASE_API_KEY ||
      "AIzaSyCFd2u4rka1mMeTN_YVR3RUwOPFurGOmZQ",
    authDomain:
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
      "famcare360-10ce7.firebaseapp.com",
    projectId:
      import.meta.env.VITE_FIREBASE_PROJECT_ID || "famcare360-10ce7",
    storageBucket:
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
      "famcare360-10ce7.firebasestorage.app",
    messagingSenderId:
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "923121936031",
    appId:
      import.meta.env.VITE_FIREBASE_APP_ID ||
      "1:923121936031:web:e7733ea2ebd05550cf64aa",
    vapidKey:
      import.meta.env.VITE_FIREBASE_VAPID_KEY ||
      "BJHyV1HttiPtEpKOxJMotcZzLN5Qj_NnrONqGJ-1KD9ZigBZpgZ47dO_aKyWRXhIVrqao88PpepMAIcH6_tUZBw",
  },
};
