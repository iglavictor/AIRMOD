# AIRMOD — 에어소프트건 외장 모딩 추천 웹서비스

> **합법적인 에어소프트건 외장 모형 액세서리 장착 호환성과 스타일을 추천하는 웹 플랫폼**  
> (본 서비스는 발사 성능·위력 개조나 내부 기구 튜닝을 엄격히 배제하며, 순수 스포츠·취미·전시 목적의 외장 커스텀만을 다룹니다.)

---

## 1. 프로젝트 소개
AIRMOD는 에어소프트 동호인과 입문자가 총기 기본 모델, 사용 환경(실내/야외/타깃/코스프레), 선호 스타일(경량/밸런스/외관/가성비), 예산을 입력하면 **규격 검증(verified)된 외장 액세서리 조합**을 자동으로 추천하고, 예상 비용(KRW), 총 중량(g/kg), AI/규칙 기반 사유 분석 및 **인터넷 유사 참고 이미지**를 한눈에 확인할 수 있는 웹서비스입니다.

---

## 2. 기술 스택
- **프론트엔드**: Pure HTML5, Modern CSS3 (CSS Variables, Flexbox/Grid), Vanilla JavaScript (ES Modules)
  *(React, Vue, Next.js, Tailwind 미사용 — 웹 표준 준수)*
- **백엔드**: Node.js 22 LTS, Vercel Serverless Functions (`/api`), `@supabase/supabase-js`, OpenAI Node SDK
- **데이터베이스**: Supabase PostgreSQL (Row Level Security 적용)
- **외부 연동**:
  - OpenAI API (`gpt-4.1-mini` 등 / 장애 시 규칙 기반 한글 템플릿 자동 폴백)
  - Google Custom Search JSON API (이미지 검색 / 미설정 시 안전한 가상 참고 이미지 모드 자동 전환)
- **테스트 & 품질**: Vitest, ESLint, 커스텀 빌드 스크립트

---

## 3. 디렉터리 구조
```text
AIRMOD/
├─ index.html                     # 메인 웹 페이지 마크업 (접근성 ARIA 준수)
├─ dev-server.js                  # 로컬 통합 개발 서버 (Node.js 내장 http)
├─ api/                           # Vercel 서버리스 함수 엔드포인트
│  ├─ models.js                   # GET /api/models (총기 목록)
│  ├─ accessories.js              # GET /api/accessories (호환 부품 목록)
│  ├─ recommend.js                # POST /api/recommend (추천 및 AI 분석)
│  └─ images.js                   # POST /api/images (유사 이미지 검색)
├─ server/                        # 백엔드 핵심 비즈니스 로직
│  ├─ supabase.js                 # DB 클라이언트 안전 래퍼 및 인메모리 목업
│  ├─ recommender.js              # 가중치 추천 계산 알고리즘 엔진
│  ├─ ai.js                       # OpenAI 연동 및 한국어 규칙 템플릿
│  ├─ image-search.js             # 구글 맞춤검색 어댑터 및 8초 타임아웃
│  └─ validation.js               # 안전한 입력 검증 모듈
├─ src/                           # 프론트엔드 소스코드
│  ├─ css/                        # 다크/사이버 룩앤필 디자인 시스템
│  │  ├─ tokens.css               # 색상, 폰트, 간격 변수 정의
│  │  ├─ layout.css               # 그리드 레이아웃 및 반응형 컨테이너
│  │  ├─ components.css           # 카드, 버튼, 칩, 모달 등 UI 스타일
│  │  └─ animations.css           # 전환 효과, 스피너, reduced-motion 지원
│  └─ js/                         # 프론트엔드 ES 모듈
│     ├─ app.js                   # 메인 이벤트 바인딩 및 흐름 제어
│     ├─ state.js                 # 클라이언트 단일 상태 저장소
│     ├─ api.js                   # 백엔드 통신 API 클라이언트
│     ├─ render.js                # DOM 렌더러 (XSS 방지 textContent 전용)
│     ├─ calculator.js            # 가격(KRW) 및 무게(g, kg) 포맷터
│     └─ storage.js               # LocalStorage 프리셋 저장소
├─ supabase/migrations/           # DB 테이블 및 초기 시드 SQL
│  ├─ 001_initial_schema.sql      # 테이블 4개, RLS 정책, 인덱스
│  └─ 002_seed_data.sql           # 가상 모델 3종, 부품 13종, 호환성 맵
├─ scripts/                       # 빌드 자동화 스크립트
│  └─ build.js                    # 정적 파일 dist/ 번들링 스크립트
├─ tests/unit/                    # 단위 테스트 (Vitest)
│  └─ recommender.test.js         # 추천 엔진 점수 및 예산 방어 검증
├─ .env                           # 로컬 환경 변수 (Git 비추적)
├─ .env.example                   # 환경 변수 템플릿
├─ package.json                   # 의존성 및 실행 스크립트
└─ vercel.json                    # Vercel 배포 및 라우팅 설정
```

---

## 4. 환경 변수 설정 (`.env`)

루트 디렉터리의 `.env` 파일에 발급받으신 키를 입력합니다:

```dotenv
# OpenAI API 설정
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini

# Supabase 설정 (서버 전용 service_role 키)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 구글 이미지 검색 API (선택 사항: 비워두면 안전한 기본 샘플 모드로 동작)
IMAGE_SEARCH_API_KEY=
IMAGE_SEARCH_ENGINE_ID=
```

---

## 5. 데이터베이스 설정 (Supabase)

1. [Supabase 대시보드](https://supabase.com/dashboard)에 접속합니다.
2. 왼쪽 메뉴의 **SQL Editor**로 이동합니다.
3. `supabase/migrations/001_initial_schema.sql` 내용을 복사하여 실행합니다 (테이블 생성).
4. `supabase/migrations/002_seed_data.sql` 내용을 복사하여 실행합니다 (초기 시드 데이터 삽입).

---

## 6. 로컬 실행 방법

```bash
# 1. 패키지 설치 (최초 1회)
npm install

# 2. 로컬 개발 서버 시작
npm start
# 또는
node dev-server.js
```

브라우저에서 **`http://localhost:3000`** 으로 접속하여 서비스를 이용할 수 있습니다.

---

## 7. 테스트 및 빌드 검증

```bash
# 코드 린트 검사
npm run lint

# 단위 테스트 실행 (Vitest)
npm test

# 프로덕션 정적 빌드 (dist/ 생성)
npm run build

# 전체 파이프라인 검증 (lint + test + build)
npm run check
```

---

## 8. 라이선스 및 안전 수칙
- 본 서비스에서 추천하는 모든 액세서리는 에어소프트 전용 외장 더미(Dummy) 부품 및 광학 장치 모형입니다.
- 실총 부품 호환, 내부 격발 기구 개조, 탄속 증대 관련 정보는 일절 취급하지 않습니다.
- 인터넷 검색 이미지는 사용자의 시각적 이해를 돕기 위한 **참고용 예시**이며 실제 추천 구성품의 외형과 완벽히 일치하지 않을 수 있습니다.

