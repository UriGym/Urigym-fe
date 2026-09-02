/**
 * Naver's login SDK is redirect-based, not popup-based like Kakao: it navigates to Naver,
 * then bounces back to VITE_NAVER_CALLBACK_URL with the access token in the URL hash.
 * That callback URL must be registered verbatim in the Naver Developers console and is
 * handled by the NaverCallback page, which reads the token and calls the backend.
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
    if (window.naver_id_login) {
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

/** Redirects the browser to Naver's login page. Resolves once redirected (never on success). */
export async function loginWithNaver(): Promise<void> {
  const clientId = import.meta.env.VITE_NAVER_CLIENT_ID;
  if (!clientId) {
    throw new Error("VITE_NAVER_CLIENT_ID가 설정되지 않았습니다.");
  }

  await loadSdk();

  const instance = new window.naver_id_login(clientId, callbackUrl());
  instance.setDomain(window.location.origin);
  instance.setState(instance.getUniqState());
  // Persist the state so the callback page can confirm this redirect wasn't forged.
  sessionStorage.setItem("naver_oauth_state", instance.oauthParams.state);
  instance.init_naver_id_login();
  window.location.href = instance.getUrl("Login");
}

/** Reads the access token Naver appended to the callback URL's hash, if present. */
export function readNaverCallbackToken(): { accessToken: string } | null {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash);

  const accessToken = params.get("access_token");
  const state = params.get("state");
  const expectedState = sessionStorage.getItem("naver_oauth_state");
  sessionStorage.removeItem("naver_oauth_state");

  if (!accessToken || !state || state !== expectedState) {
    return null;
  }

  return { accessToken };
}
