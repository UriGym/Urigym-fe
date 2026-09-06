/**
 * Daum(카카오) 우편번호 서비스 — 별도 API 키나 계정 없이 쓸 수 있는 공식 무료 위젯.
 * 주소 자유 입력 대신 이 팝업으로 실제 존재하는 주소만 고르게 해서 오타/엉뚱한 주소를 막는다.
 */

const SDK_SRC = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
const SDK_ID = "daum-postcode-sdk";

let loaderPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (window.daum?.Postcode) {
      resolve();
      return;
    }

    const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");

    if (!existing) {
      script.id = SDK_ID;
      script.src = SDK_SRC;
      document.head.appendChild(script);
    }

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      loaderPromise = null;
      reject(new Error("주소 검색 서비스를 불러오지 못했습니다."));
    });
  });

  return loaderPromise;
}

export interface AddressResult {
  /** 도로명 주소 (없으면 지번 주소로 대체). */
  address: string;
  zonecode: string;
}

/** Opens the Daum Postcode popup and resolves with the address the user picked. */
export async function searchAddress(): Promise<AddressResult> {
  await loadSdk();

  return new Promise((resolve) => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        resolve({ address: data.roadAddress || data.jibunAddress, zonecode: data.zonecode });
      },
    }).open();
  });
}
