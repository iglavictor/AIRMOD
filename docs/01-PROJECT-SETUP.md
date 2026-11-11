# 01 — 프로젝트 생성 및 실행

## 목표
Vercel에서 정적 프런트와 Node.js API가 함께 동작하는 프로젝트를 만듭니다.

## 스택
- HTML5, CSS3, Vanilla JavaScript(ES Modules)
- Node.js 22 LTS, npm, Vercel Functions (`/api`)
- OpenAI 공식 Node SDK, `@supabase/supabase-js`
- Supabase PostgreSQL
- Google Programmable Search JSON API 등 라이선스/약관을 준수하는 이미지 검색 API 1개
- 테스트: Vitest(단위), Playwright(E2E), ESLint

## 디렉터리
```text
AIRMOD/
├─ index.html
├─ public/assets/          # 라이선스 확인된 자체 이미지 및 아이콘
├─ src/
│  ├─ css/{tokens,layout,components,animations}.css
│  ├─ js/{app,state,api,render,calculator,storage}.js
│  └─ js/components/{model-picker,configurator,result-panel,image-gallery}.js
├─ api/{models,accessories,recommend,images}.js
├─ server/{supabase,recommender,ai,image-search,validation}.js
├─ supabase/{schema.sql,seed.sql}
├─ tests/{unit,e2e}/
├─ docs/
├─ AGENTS.md
├─ PRD.md
├─ README.md
├─ .env.example
├─ .gitignore
├─ package.json
└─ vercel.json
```

## 필수 환경변수
```dotenv
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
IMAGE_SEARCH_API_KEY=
IMAGE_SEARCH_ENGINE_ID=
```
- OpenAI 모델명은 계정에서 이용 가능한 모델로 변경 가능하며 서버 설정에서만 참조.
- `.env.local`은 Git에 올리지 않음. `.env.example`은 값 없이 키만 기록.
- Supabase 서비스 롤 키는 서버 전용. 프런트에 직접 연결하지 않음.

## package.json 명령 계약
- `npm run dev`: Vercel CLI를 통해 정적 파일과 `/api`를 함께 로컬 실행(`vercel dev`).
- `npm run lint`: ESLint.
- `npm test`: Vitest.
- `npm run test:e2e`: Playwright.
- `npm run build`: `dist/`에 `index.html`, CSS, JS, 정적 에셋을 복사하는 스크립트 실행.
- `npm run check`: lint + test + build.

## Vercel 설정
- 정적 출력 디렉터리: `dist`.
- `/api/*`는 Vercel Functions로 처리. 프런트의 `/api` 호출을 정적 파일로 리라이트하지 않음.
- 프런트 라우팅은 단일 페이지 상태 기반. SPA fallback은 `/api` 경로 제외.
- 서버리스 함수에서 이미지 검색 및 OpenAI 호출. 비밀키는 Vercel Environment Variables로 등록.

## 초기 실행 절차
1. `npm install`.
2. Supabase 프로젝트 생성 후 `schema.sql`, `seed.sql` 순서로 실행.
3. `.env.example` 복사하여 `.env.local` 작성.
4. `npm run dev`.
5. `/api/models` 정상 응답 및 화면 렌더링 확인.
6. `npm run check`.

## 완료 기준
- 신규 환경에서 README만 보고 15분 내 실행 가능(계정 및 키 발급 시간 제외).
- API 경로와 정적 리소스가 로컬·배포 환경에서 모두 정상 작동.
