# 03 — 프런트엔드 기능 구현

## 상태 모델
```js
const state = {
  step: 'home', // home | model | configure | result
  modelId: null,
  environment: 'indoor', // indoor | outdoor | target | display
  style: 'balanced', // lightweight | balanced | appearance | budget
  priority: 'appearance', // appearance | weight | price | comfort
  budgetKRW: 500000,
  selectedAccessoryIds: [],
  recommendation: null,
  images: [],
  loading: false,
  error: null
};
```

## UI 구현 순서
1. `index.html` 시맨틱 구조 및 한국어 메타 태그 작성.
2. CSS 디자인 토큰/그리드/헤더/카드/버튼/모달 구현.
3. `GET /api/models`로 모델 목록 조회, 플랫폼·제조사 필터.
4. 사용 환경/성향/예산/우선순위 폼 작성, 유효성 검증.
5. `POST /api/recommend` 결과 표시(부품/점수/장단점/총액/중량).
6. `POST /api/images` 결과를 출처와 함께 이미지 갤러리로 표시.
7. 부품 교체 시 `POST /api/recommend`에 `selectedAccessoryIds`를 전달하여 서버 검증 후 갱신.
8. LocalStorage 프리셋 저장/복원/삭제.
9. 모션, 접근성, 오류 상태 구현.

## 입력 검증
- 모델 ID는 조회된 목록의 값만 선택 가능.
- 예산은 정수, 100000~2000000, 50000 단위.
- 선택형 입력은 정의된 enum만 허용.
- 필수 선택 없으면 추천 버튼 비활성화 및 오류 안내.

## 데이터 표시
- KRW: `new Intl.NumberFormat('ko-KR').format(value) + '원'`.
- 중량: `g` 정수 및 `kg` 소수 2자리.
- `추천 적합도`는 서비스 점수이며 성능 지표 아님을 명시.
- AI 설명이 없는 경우 서버가 반환한 규칙 기반 한국어 문구 사용.

## 이미지 갤러리
- 첫 번째 검색 결과를 대표로, 최대 3개를 카드로 렌더링.
- 제목, 출처 도메인, `원본 보기` 링크, `유사한 참고 이미지` 문구 표시.
- 결과 없으면 기본 모델 이미지 및 `일치하는 참고 이미지를 찾지 못했습니다`.
- 이미지 로딩 실패 시 대체 플레이스홀더. 이미지의 `onerror` 무한 반복 금지.

## 로컬 저장 형식
```json
{
  "version": 1,
  "savedAt": "2026-11-11T03:00:00.000Z",
  "modelId": "model-001",
  "environment": "indoor",
  "style": "balanced",
  "priority": "appearance",
  "budgetKRW": 500000,
  "selectedAccessoryIds": ["acc-001"]
}
```
- LocalStorage에는 API 키, 개인정보, 이미지 원본 바이너리 저장 금지.
- 저장 프리셋 불러오기 시 서버에서 부품 존재·호환성 재검증.

## 오류 메시지 예시
- `추천할 수 있는 호환 부품이 없습니다. 다른 모델이나 조건을 선택해 주세요.`
- `예산이 기본 모델 가격보다 낮습니다.`
- `참고 이미지 검색이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.`
- `추천 설명을 불러오지 못해 기본 설명을 표시합니다.`

## 완료 기준
- 주요 기능에 죽은 버튼 없음.
- 결과 변경 시 금액/무게/이미지 검색 상태 동기화.
- 키보드 및 모바일 조작 가능.
