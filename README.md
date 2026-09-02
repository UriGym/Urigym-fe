# UriGym - 지도 기반 체육관 안내

내 위치를 기준으로 주변 체육관을 지도와 리스트로 찾고, 출석 체크와 체육관 운영까지 할 수 있는 서비스입니다.

## 기술 스택

- React 18 + TypeScript, Vite 7
- Tailwind CSS + shadcn/ui
- React Router, TanStack React Query
- 카카오맵 JavaScript SDK

백엔드는 별도 저장소([Urigym-be](https://github.com/UriGym/Urigym-be))의 Spring Boot 서버를 사용합니다.

## 시작하기

```bash
npm install
cp .env.example .env   # 값 채우기
npm run dev
```

개발 서버는 http://localhost:5173 에서 실행됩니다 (백엔드 CORS 허용 포트).

### 환경 변수

| 변수 | 설명 |
|------|------|
| `VITE_API_URL` | 백엔드 API 주소 (기본 `http://localhost:8080/api`) |
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JavaScript 키 |
| `VITE_KAKAO_APP_KEY` | 카카오 로그인용 JavaScript 키 |
| `VITE_NAVER_CLIENT_ID` | 네이버 로그인 Client ID |
| `VITE_NAVER_CALLBACK_URL` | 네이버 로그인 콜백 URL (기본 `.../oauth/naver/callback`) |

**카카오맵 키 발급**: [카카오 개발자 사이트](https://developers.kakao.com)에서 애플리케이션을 만들고
`앱 키 > JavaScript 키`를 복사한 뒤, `플랫폼 > Web`에 `http://localhost:5173`을 사이트 도메인으로 등록해야
지도가 로드됩니다. 키가 없으면 지도 영역에 안내 메시지가 표시되고 나머지 기능은 정상 동작합니다.

**소셜 로그인 키 발급**:
- 카카오: 같은 애플리케이션에서 `카카오 로그인` 활성화 → `동의항목`에서 닉네임/카카오계정(이메일) 필수 설정 →
  `Redirect URI`에 `http://localhost:5173` 등록. 지도 키와 로그인 키가 같은 앱이면 `VITE_KAKAO_APP_KEY`는
  `VITE_KAKAO_MAP_KEY`와 동일한 값을 써도 됩니다.
- 네이버: [네이버 개발자 센터](https://developers.naver.com)에서 애플리케이션 등록 → 사용 API에
  `네이버 로그인` 추가 → 서비스 URL `http://localhost:5173`, 콜백 URL
  `http://localhost:5173/oauth/naver/callback`을 **정확히 동일하게** 등록해야 합니다.

두 로그인 모두 키가 비어 있으면 버튼 클릭 시 "설정되지 않았습니다" 안내만 뜨고, 나머지 기능에는
영향을 주지 않습니다.

## 화면 구성

| 경로 | 화면 | 접근 권한 |
|------|------|-----------|
| `/` | 홈 — 현재 위치 기반 지도/리스트, AI 추천 랭킹 | 전체 |
| `/search` | 체육관 검색 | 전체 |
| `/gym/:id` | 체육관 상세 — 정보, 일정, 리뷰, 공지, 신고 | 전체 |
| `/attendance` | 출석 체크 (전화번호 인증) | 로그인 |
| `/mypage` | 마이페이지 | 전체 |
| `/support` | 고객센터 — 문의 / 신고 및 내역 | 로그인 |
| `/owner-application` | 관장 등록 신청 (서류 업로드) | 일반 사용자 |
| `/owner` | 관장 대시보드 | 관장 |
| `/admin` | 관리자 페이지 | 관리자 |

권한 게이트는 `components/auth/RoleRoute.tsx`가 담당하며, 실제 검사는 백엔드에서도 동일하게 수행됩니다.

## 디자인 시스템

`src/index.css`의 CSS 변수로 정의되어 있습니다.

- 주 색상: 딥 블루 `hsl(217 91% 50%)` — 신뢰, 건강
- 강조 색상: 코랄 오렌지 `hsl(16 90% 55%)` — 에너지, 활력
- 배경: 화이트 & 그레이 톤

## 스크립트

- `npm run dev` — 개발 서버 (5173)
- `npm run build` — 프로덕션 빌드
- `npm run lint` — ESLint
