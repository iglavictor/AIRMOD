# 04 — Node.js API / 추천 엔진 / AI / 인터넷 이미지 검색

## API 계약
모든 API 응답은 JSON. 오류는 `{ "error": { "code": "...", "message": "한국어 메시지" } }`.

### GET /api/models
- 200: `{ "models": [{ "id", "name", "manufacturer", "platform", "priceKRW", "weightGrams", "imageUrl" }] }`.

### GET /api/accessories?modelId=...
- 200: `{ "accessories": [{ "id", "name", "category", "priceKRW", "weightGrams", "imageUrl", "compatibilityStatus" }] }`.
- 공개 조회는 verified 호환 부품만 반환.

### POST /api/recommend
요청:
```json
{
  "modelId": "model-001",
  "environment": "indoor",
  "style": "balanced",
  "priority": "appearance",
  "budgetKRW": 500000,
  "selectedAccessoryIds": []
}
```
응답 200:
```json
{
  "modelId": "model-001",
  "accessories": [],
  "basePriceKRW": 300000,
  "totalPriceKRW": 300000,
  "totalWeightGrams": 2500,
  "fitScore": 78,
  "reason": "선택하신 예산과 외관 선호를 고려했습니다.",
  "pros": ["예산 내 구성"],
  "cons": ["액세서리 선택 폭이 제한적입니다."],
  "explanationSource": "rule"
}
```
- 요청 바디는 10KB 이하, Zod 또는 동등한 스키마로 검증.
- `selectedAccessoryIds`가 비어 있으면 추천 엔진이 선택. 값이 있으면 해당 부품을 그대로 검증하여 결과 계산.
- 잘못된 입력 400, 모델 없음 404, 예산/호환 충돌 422, 서버 오류 500.

### POST /api/images
요청: `{ "modelId": "model-001", "accessoryIds": ["acc-001"] }`.
응답 200:
```json
{
  "status": "ok",
  "disclaimer": "유사한 참고 이미지이며 실제 추천 구성과 다를 수 있습니다.",
  "images": [
    {
      "title": "검색 공급자가 제공한 제목",
      "imageUrl": "https://example.com/image.jpg",
      "sourceUrl": "https://example.com/page",
      "sourceDomain": "example.com",
      "similarityScore": 82
    }
  ]
}
```
- 위 URL은 API 형식 예시일 뿐 실제 이미지가 아님.
- 검색 결과 0건: `{ "status": "empty", "images": [], "disclaimer": "..." }`.
- 공급자 장애: HTTP 503과 재시도 가능한 오류 코드 반환. 프런트는 기본 이미지 유지.

## 추천 로직
- Supabase에서 모델, 액세서리, verified 호환 관계 조회.
- 예산 충족 후보만 생성. 슬롯별 최대 1개, 부품 중복 금지.
- 환경/성향/우선순위 태그를 데이터 기반으로 0~100 점수화.
- 점수: `0.30*environment + 0.25*style + 0.25*budget + 0.20*priority`.
- 예산 점수는 `100`(예산 이하), 초과는 후보 탈락. 비용 낮을수록 우선하는 것은 동점 규칙으로 처리.
- 결정론적 결과를 위해 후보 정렬 고정, 동일 요청에 동일 응답.
- 비용/중량은 정수 덧셈. 설명에 수치를 생성하지 않고 서버 계산값을 전달.

## OpenAI API 사용
- OpenAI는 추천 결과에 대한 **한국어 설명·장단점 문구**만 생성.
- 입력: 서버가 검증한 모델/부품 이름, 태그, 실제 가격/무게, 사용자 조건.
- 출력: JSON schema `{reason:string,pros:string[],cons:string[]}`; 길이 제한 적용.
- 시스템 지침: 사실을 지어내지 말 것, 성능 향상/불법 개조 안내 금지, 가격/무게 변경 금지.
- 응답 파싱 실패/타임아웃/할당량 초과 시 규칙 기반 한국어 문구로 대체.
- API 키는 서버에서만 사용, 원문 사용자 입력을 불필요하게 로깅하지 않음.

## 이미지 검색 공급자
- 1차 구현은 Google Programmable Search JSON API의 이미지 검색 모드(`searchType=image`)를 예시로 사용. 실제 제공 범위·과금·이용약관은 구현 시 공식 문서에서 확인.
- 공급자 어댑터 `searchSimilarAirsoftImages(query, limit)` 인터페이스를 정의해 교체 가능하게 구현.
- 쿼리: 에어소프트 모델명 + `airsoft` + 외장 부품 카테고리/제품명 + 외관 스타일 키워드. 무관한 전술적 작전 최적화 문구는 포함하지 않음.
- 공급자 결과의 `link`(이미지), `image.contextLink`(원본 페이지), `title`만 사용. 누락 결과 제외.
- 유사도: 모델명 일치 50점, 액세서리 카테고리/이름 일치 30점, 스타일 일치 20점. 제목/설명/검색 메타데이터 텍스트의 정규화된 키워드 일치로 평가. **시각적 동일성 검증 아님**.
- 동일 sourceUrl 또는 imageUrl 중복 제거, 상위 3건 반환.
- URL은 HTTPS만 허용, `javascript:`, `data:`, 로컬/사설 주소 거부. 서버에서 원본 이미지 파일을 직접 다운로드하지 않음.
- 8초 타임아웃, 요청당 최대 3개 결과, 24시간 캐시(동일 구성 키), IP별 분당 10회 이미지 검색 제한(운영 환경에서는 공유 저장소 기반).
- 출처 링크와 `유사한 참고 이미지` 고지 필수. 검색 공급자의 표시 및 저작권 약관 준수.

## 보안 및 제한
- 입력 검증, JSON 바디 크기 제한, 동일 출처 호출 우선.
- 외부 URL을 서버가 임의로 fetch하는 SSRF 경로 금지.
- 사용자에게 외부 검색 결과가 추천 제품의 실제 사진인 것처럼 표시 금지.
- 키/토큰/서비스 롤 비공개. DB 에러 원문을 사용자에게 반환하지 않음.

## 완료 기준
- 정상/무결과/오류 응답 테스트.
- AI가 중단되어도 추천 엔진 정상.
- 이미지 검색은 실제 공급자 응답만 출력하며 허위 URL 생성 없음.
