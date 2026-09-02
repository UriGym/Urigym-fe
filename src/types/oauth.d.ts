/** Minimal typings for the Kakao and Naver login SDKs' global objects. */

interface KakaoAuthResponse {
  access_token: string;
}

interface KakaoAuthError {
  error: string;
  error_description?: string;
}

interface Window {
  Kakao: {
    init: (appKey: string) => void;
    isInitialized: () => boolean;
    Auth: {
      login: (options: {
        scope?: string;
        success: (response: KakaoAuthResponse) => void;
        fail: (error: KakaoAuthError) => void;
      }) => void;
    };
  };

  naver_id_login: new (clientId: string, callbackUrl: string) => {
    oauthParams: { state: string };
    setDomain: (domain: string) => void;
    setState: (state: string) => void;
    getUniqState: () => string;
    init_naver_id_login: () => void;
    getUrl: (type: "Login") => string;
  };
}
