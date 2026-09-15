// 주소 문자열의 첫 토큰(시/도)을 짧은 지역명으로 정규화한다.
// 표준 도로명주소는 "경기도 시흥시 월곶동 1010-4"처럼 시/도 정식 명칭으로 시작한다.
const REGION_ALIASES: Record<string, string> = {
  서울특별시: "서울",
  서울: "서울",
  부산광역시: "부산",
  부산: "부산",
  대구광역시: "대구",
  대구: "대구",
  인천광역시: "인천",
  인천: "인천",
  광주광역시: "광주",
  광주: "광주",
  대전광역시: "대전",
  대전: "대전",
  울산광역시: "울산",
  울산: "울산",
  세종특별자치시: "세종",
  세종시: "세종",
  세종: "세종",
  경기도: "경기",
  경기: "경기",
  강원특별자치도: "강원",
  강원도: "강원",
  강원: "강원",
  충청북도: "충북",
  충북: "충북",
  충청남도: "충남",
  충남: "충남",
  전북특별자치도: "전북", // 2024년 전라북도 → 전북특별자치도 개칭
  전라북도: "전북",
  전북: "전북",
  전라남도: "전남",
  전남: "전남",
  경상북도: "경북",
  경북: "경북",
  경상남도: "경남",
  경남: "경남",
  제주특별자치도: "제주",
  제주도: "제주",
  제주: "제주",
};

export const REGION_ORDER = [
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
  "기타",
] as const;

export const UNKNOWN_REGION = "기타";

/** 주소 문자열의 첫 토큰(시/도)으로 짧은 지역명을 반환한다. 매핑 실패 시 "기타". */
export function getRegion(address: string): string {
  const firstToken = address.trim().split(/\s+/)[0];
  if (!firstToken) return UNKNOWN_REGION;
  return REGION_ALIASES[firstToken] ?? UNKNOWN_REGION;
}

if (import.meta.env.DEV) {
  console.assert(getRegion("서울특별시 광진구") === "서울", "region: 서울특별시 매핑 실패");
  console.assert(getRegion("경기도 시흥시 월곶동 1010-4") === "경기", "region: 경기도 매핑 실패");
  console.assert(getRegion("전북특별자치도 전주시") === "전북", "region: 전북특별자치도 매핑 실패");
  console.assert(getRegion("Somewhere Unknown") === UNKNOWN_REGION, "region: 미매핑 주소 기타 처리 실패");
}
