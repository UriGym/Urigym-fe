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

  naver: {
    LoginWithNaverId: new (options: {
      clientId: string;
      callbackUrl: string;
      isPopup?: boolean;
    }) => {
      init: () => void;
      authorize: () => void;
      accessToken?: { accessToken: string };
    };
  };

  daum: {
    Postcode: new (options: {
      oncomplete: (data: { roadAddress: string; jibunAddress: string; zonecode: string }) => void;
    }) => { open: () => void };
  };
}
