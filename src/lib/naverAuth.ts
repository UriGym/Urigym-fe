/**
 * Naver's official LoginWithNaverId SDK. Redirect-based, not popup-based like Kakao:
 * authorize() navigates to Naver, then bounces back to VITE_NAVER_CALLBACK_URL with the
 * result in the URL hash. That callback URL must be registered verbatim in the Naver
 * Developers console. The SDK itself generates and validates the CSRF state token
 * (stored in localStorage) — no need to manage it by hand.
 *
 * Note: the SDK's global is `window.naver.LoginWithNaverId`, not `window.naver_id_login`
 * — the older `naver_id_login` global name this file used to target no longer exists in
 * the SDK bundle Naver serves at this URL.
 */

const SDK_ID = "naver-login-sdk";
const SDK_SRC = "https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js";

let loaderPromise: Promise<void> | null = null;

export function isNaverLoginConfigured(): boolean {
  return Boolean(import.meta.env.VITE_NAVER_CLIENT_ID);
}

function loadSdk(): Promise<void> {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (window.naver?.LoginWithNaverId) {
      resolve();
      return;
    }

    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    if (!existing) {
      script.id = SDK_ID;
      script.async = true;
      script.src = SDK_SRC;
      document.head.appendChild(script);
    }

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      loaderPromise = null;
      reject(new Error("네이버 SDK를 불러오지 못했습니다."));
    });
  });

  return loaderPromise;
}

function callbackUrl(): string {
  return import.meta.env.VITE_NAVER_CALLBACK_URL || `${window.location.origin}/oauth/naver/callback`;
}

async function createInstance() {
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
  if (!clientId) {
    throw new Error("VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.");
  }

  await loadSdk();
  return new window.naver.LoginWithNaverId({ clientId, callbackUrl: callbackUrl(), isPopup: false });
}

/** Redirects the browser to Naver's login page. Resolves once redirected (never on success). */
export async function loginWithNaver(): Promise<void> {
  (await createInstance()).authorize();
}

/** Reads the access token from the callback URL, if the SDK confirms a valid callback. */
export async function readNaverCallbackToken(): Promise<{ accessToken: string } | null> {
  const instance = await createInstance();
  instance.init();
  return instance.accessToken ? { accessToken: instance.accessToken.accessToken } : null;
}
