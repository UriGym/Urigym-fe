/** Loads the Kakao JS SDK (login product) and wraps its popup login flow. */

const SDK_ID = "kakao-sdk";
const SDK_SRC = "https://developers.kakao.com/sdk/js/kakao.min.js";

let loaderPromise: Promise<void> | null = null;

export function isKakaoLoginConfigured(): boolean {
  return Boolean(import.meta.env.VITE_KAKAO_APP_KEY);
}

function loadSdk(): Promise<void> {
  if (loaderPromise) return loaderPromise;

  const appKey = import.meta.env.VITE_KAKAO_APP_KEY;
  if (!appKey) {
    return Promise.reject(new Error("VITE_KAKAO_APP_KEY가 설정되지 않았습니다."));
  }

  loaderPromise = new Promise((resolve, reject) => {
    if (window.Kakao?.isInitialized()) {
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

    const onReady = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(appKey);
      }
      resolve();
    };

    if (window.Kakao) {
      onReady();
      return;
    }

    script.addEventListener("load", onReady);
    script.addEventListener("error", () => {
      loaderPromise = null;
      reject(new Error("카카오 SDK를 불러오지 못했습니다."));
    });
  });

  return loaderPromise;
}

// If the login app's domain isn't registered in the Kakao Developers console (KOE009), the
// popup never opens and neither success nor fail ever fires — the promise below would hang
// forever without this timeout.
const LOGIN_TIMEOUT_MS = 15000;

/** Opens the Kakao login popup and resolves with the access token. */
export async function loginWithKakao(): Promise<string> {
  await loadSdk();

  const login = new Promise<string>((resolve, reject) => {
    window.Kakao.Auth.login({
      scope: "account_email,profile_nickname",
      success: (auth) => resolve(auth.access_token),
      fail: (error) => reject(new Error(error?.error_description || "카카오 로그인에 실패했습니다.")),
    });
  });

  const timeout = new Promise<string>((_, reject) => {
    setTimeout(
      () => reject(new Error("카카오 로그인 응답이 없습니다. 팝업이 차단되었거나 카카오 앱 설정을 확인해주세요.")),
      LOGIN_TIMEOUT_MS
    );
  });

  return Promise.race([login, timeout]);
}
