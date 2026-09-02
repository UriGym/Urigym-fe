/** Loads the Kakao Maps SDK once and hands back the global `kakao.maps` namespace. */

const SDK_ID = 'kakao-maps-sdk';

let loaderPromise: Promise<typeof window.kakao.maps> | null = null;

export function isKakaoKeyConfigured(): boolean {
  return Boolean(import.meta.env.VITE_KAKAO_MAP_KEY);
}

export function loadKakaoMaps(): Promise<typeof window.kakao.maps> {
  if (loaderPromise) return loaderPromise;

  const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!appKey) {
    return Promise.reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.'));
  }

  loaderPromise = new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => resolve(window.kakao.maps));
      return;
    }

    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement('script');

    if (!existing) {
      script.id = SDK_ID;
      script.async = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
      document.head.appendChild(script);
    }

    script.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao.maps)));
    script.addEventListener('error', () => {
      loaderPromise = null;
      reject(new Error('카카오맵 SDK를 불러오지 못했습니다. API 키와 등록 도메인을 확인해주세요.'));
    });
  });

  return loaderPromise;
}
