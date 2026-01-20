# UriGym - 내 주변 헬스장 찾기

가까운 헬스장을 쉽고 빠르게 찾아보세요.

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite 7
- Tailwind CSS + shadcn/ui
- TanStack React Query

### Backend
- Java 17 + Spring Boot 3.4
- Spring Data JPA
- Spring Security + JWT
- PostgreSQL (Production) / H2 (Development)

## 프로젝트 구조

```
gym-finder-pro-main/
├── src/                    # Frontend (React)
│   ├── api/               # API 클라이언트
│   ├── components/        # React 컴포넌트
│   ├── pages/            # 페이지 컴포넌트
│   └── ...
├── backend/               # Backend (Spring Boot)
│   ├── src/main/java/com/urigym/
│   │   ├── config/       # 설정 (Security, JWT, CORS)
│   │   ├── domain/       # 도메인별 패키지
│   │   │   ├── auth/     # 인증
│   │   │   ├── gym/      # 체육관
│   │   │   ├── user/     # 사용자
│   │   │   ├── review/   # 리뷰
│   │   │   └── ...
│   │   └── common/       # 공통 (예외, 응답)
│   └── src/main/resources/
│       └── application.yml
└── package.json
```

## 시작하기

### 사전 요구사항
- Node.js 18+
- Java 17+
- PostgreSQL (선택사항, 로컬 개발시 H2 사용)

### Backend 실행

```bash
cd backend

# Gradle로 실행 (로컬 개발 - H2 DB)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
gradle bootRun --args='--spring.profiles.active=local'

# 또는 JAR 빌드 후 실행
gradle build
java -jar build/libs/urigym-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=local
```

서버가 실행되면:
- API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 Console: http://localhost:8080/h2-console

### Frontend 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정 (선택사항)
cp .env.example .env

# 개발 서버 실행
npm run dev
```

## API 엔드포인트

### 인증
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |

### 체육관
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/gyms` | 체육관 목록 |
| GET | `/api/gyms/{id}` | 체육관 상세 |
| GET | `/api/gyms/search?keyword=` | 체육관 검색 |
| GET | `/api/gyms/category/{category}` | 카테고리별 조회 |

### 리뷰
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/gyms/{id}/reviews` | 리뷰 목록 |
| POST | `/api/gyms/{id}/reviews` | 리뷰 작성 (인증 필요) |

### 출석
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/attendances` | 내 출석 기록 (인증 필요) |
| POST | `/api/attendances` | 출석 체크 (인증 필요) |

## 스크립트

### Frontend
- `npm run dev` - 개발 서버 실행 (포트 5173)
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint 실행
- `npm run preview` - 빌드 미리보기

### Backend
- `gradle bootRun` - 개발 서버 실행
- `gradle build` - JAR 빌드
- `gradle test` - 테스트 실행

## 환경 변수

### Frontend (.env)
```
VITE_API_URL=http://localhost:8080/api
```

### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/urigym
    username: postgres
    password: postgres

jwt:
  secret: your-secret-key
  expiration: 86400000
```
