# AGENTS.md — AIRMOD 코딩 에이전트 작업 규칙

## 1. 역할과 작업 순서
당신은 Antigravity AI 코딩 에이전트입니다. 한국어 사용자용 **에어소프트건 외장 모딩 추천 웹서비스**를 구현합니다. 작업 전 `PRD.md` 및 `docs/` 6개 문서를 모두 읽으세요. 충돌 시 보안/안전 요구사항 > PRD > 세부 문서 순으로 따르며, 모호한 부분은 임의 확장하지 말고 TODO로 기록합니다.

1. 프로젝트 구조 및 의존성을 설치합니다.
2. DB 마이그레이션과 시드 데이터를 준비합니다.
3. API와 추천 로직을 구현합니다.
4. 한국어 UI와 반응형 애니메이션을 구현합니다.
5. 단위/통합/E2E 테스트 및 빌드 검증을 수행합니다.
6. 검증 결과와 미완료 사항을 README에 기록합니다.

## 2. 기술 및 구조 제한
- Frontend: 순수 HTML5, CSS3, JavaScript ES Modules. React/Vue/Next.js/TypeScript/Tailwind 사용 금지.
- Backend: Node.js 22 LTS, Vercel Serverless Functions (`api/*.js`), `@supabase/supabase-js`, OpenAI 공식 Node SDK.
- DB: Supabase PostgreSQL. 배포: Vercel.
- 외부 이미지 검색은 합법적인 검색 API 공급자 하나를 환경변수로 구성합니다. 예: Google Programmable Search JSON API. 웹페이지 무단 스크래핑 금지.
- OpenAI API 키, 이미지 검색 API 키, Supabase service role 키는 서버에만 둡니다. 프런트 코드/로그/응답에 노출하지 않습니다.
- DB 수치 및 이미지 검색 결과를 AI가 생성한 사실처럼 표시하지 않습니다.
- 이미지 검색은 에어소프트 제품 및 외관 참고용으로만 사용하며 결과가 실제 구성과 동일하다고 주장하지 않습니다.

## 3. 작업 규칙
- 기능 ID(FR-xx)에 맞춰 작은 단위로 구현하고 테스트합니다.
- 사용자가 볼 문구는 전부 자연스러운 한국어. 금액은 KRW, 무게는 g/kg, 숫자는 `ko-KR` 형식.
- 화면의 클릭 요소는 실제 동작하거나 명확히 비활성화해야 합니다. 가짜 기능 버튼 금지.
- API 실패 시 재시도 버튼과 안전한 한국어 오류 메시지를 제공합니다.
- `prefers-reduced-motion` 준수, 키보드 접근성, 포커스 표시, 이미지 대체 텍스트 필수.
- 부품 호환성은 DB에서 `verified`인 관계만 추천 허용. 확인되지 않으면 `미확인` 표시.
- 부품 가격/무게는 DB만 사용하고, AI는 설명 생성만 담당합니다.
- 발사 성능·위력·사거리 개선, 내부 기구 개조, 실총 전환, 불법 개조 가이드는 구현 범위에서 제외합니다.
- 사용자 입력을 HTML로 삽입할 때 `innerHTML` 금지. 텍스트는 `textContent` 사용.
- 검색 이미지 원본/썸네일 URL을 신뢰하지 말고 URL 스킴과 허용 조건을 검사합니다.

## 4. 완료 전 필수 확인
- `npm run lint`, `npm test`, `npm run build` 성공.
- 비밀키가 Git 추적 파일에 없는지 확인.
- 모바일 375px, 태블릿 768px, 데스크톱 1440px 검증.
- 이미지 검색 결과 0건, 외부 API 장애, AI 장애, DB 장애 테스트.
- 기능 요구사항 및 테스트 기준은 `PRD.md`와 `docs/06-TEST-DEPLOY.md` 참조.
