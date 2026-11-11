# 05 — Supabase 데이터베이스 설계

## 원칙
- DB는 제품 가격·무게·호환성의 단일 진실 공급원.
- 모든 금액 KRW 정수, 중량 g 정수.
- `verified`가 아닌 호환성은 자동 추천 불가.
- 초기 시드 상품은 가상 예시임을 UI에 표시. 운영 시 검증된 실제 에어소프트 상품 데이터로 교체.

## 테이블
### airsoft_models
- `id uuid primary key default gen_random_uuid()`
- `slug text unique not null`
- `name text not null`, `manufacturer text not null`, `platform text not null`
- `price_krw integer not null check(price_krw >= 0)`
- `weight_grams integer not null check(weight_grams > 0)`
- `image_url text`, `is_active boolean default true`

### accessories
- `id uuid primary key default gen_random_uuid()`
- `slug text unique not null`, `name text not null`, `manufacturer text not null`
- `category text not null`, `slot text not null`
- `price_krw integer not null check(price_krw >= 0)`
- `weight_grams integer not null check(weight_grams >= 0)`
- `image_url text`, `is_active boolean default true`
- `environment_tags text[] default '{}'`, `style_tags text[] default '{}'`, `priority_tags text[] default '{}'`

### model_accessory_compatibility
- `model_id uuid references airsoft_models(id) on delete cascade`
- `accessory_id uuid references accessories(id) on delete cascade`
- `status text not null check(status in ('verified','unverified','incompatible'))`
- `evidence_note text`, `verified_at timestamptz`
- `primary key(model_id, accessory_id)`

### image_search_cache
- `query_hash text primary key`, `results jsonb not null`, `expires_at timestamptz not null`, `created_at timestamptz default now()`
- 이미지 검색 메타데이터만 캐시; 이미지 바이너리 저장 금지.

## 권한 정책
- 프런트에서 Supabase 직접 접속 금지. 서버 API에서만 DB 접근.
- service role 키는 서버 환경변수에만 저장.
- RLS를 모든 public 테이블에 활성화하고 익명 사용자에게 직접 쓰기 권한 부여 금지.
- 서버 측 입력 검증 후 조회. 시드/마이그레이션은 관리자만 수행.

## 시드 데이터
- 모델 최소 3개: 서로 다른 플랫폼의 **가상 에어소프트 모델**.
- 액세서리 최소 12개: 에어소프트 외장 액세서리 및 장식품.
- verified 호환 관계 최소 12개. 각 모델에 추천 가능한 조합 최소 1개.
- 가상 데이터의 이름에 `샘플` 또는 `예시` 포함. 실제 브랜드/가격이라고 주장하지 않음.
- 테스트용 미호환 관계 2개, 미확인 관계 2개 추가.

## 조회 및 인덱스
- `airsoft_models(platform, is_active)`.
- `accessories(category, is_active)`.
- `model_accessory_compatibility(model_id, status)`.
- `image_search_cache(expires_at)`.
- 정렬은 이름 또는 slug 기준으로 고정.

## 데이터 검증
- 음수 가격/중량 거부.
- 없는 모델/액세서리 참조 거부.
- 미확인/비호환 부품 추천 제외.
- 비활성화 제품은 새 추천에서 제외.
- 삭제/가격 변경 후 저장된 프리셋 복원 시 서버 재검증.

## 완료 기준
- schema.sql 한 번 실행으로 생성 가능, seed.sql 재실행해도 중복 없음(upsert).
- 서비스 롤 키가 클라이언트 번들에 포함되지 않음.
