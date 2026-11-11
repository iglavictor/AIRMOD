-- ==============================================================================
-- 001_initial_schema.sql
-- AIRMOD 서비스 초기 데이터베이스 테이블 및 인덱스, RLS 보안 정책 정의
-- ==============================================================================

-- 1. UUID 확장 기능 활성화 (고유 식별자 생성을 위해 필요)
create extension if not exists "pgcrypto";

-- 2. 에어소프트건 기본 모델 테이블 (airsoft_models)
-- 사용자가 선택할 수 있는 기본 총기 모델 정보를 보관합니다.
create table if not exists public.airsoft_models (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    name text not null,
    manufacturer text not null,
    platform text not null, -- 예: AR-15 / AK / Handgun 등
    price_krw integer not null check (price_krw >= 0),
    weight_grams integer not null check (weight_grams > 0),
    image_url text,
    is_active boolean default true,
    created_at timestamptz default now()
);

-- 3. 외장 액세서리/부품 테이블 (accessories)
-- 장착 가능한 외장 광학 장비, 소음기 모형, 그립, 슬링 등의 정보입니다.
create table if not exists public.accessories (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    name text not null,
    manufacturer text not null,
    category text not null, -- optic, muzzle, grip, sling, stock 등
    slot text not null,     -- 동일 슬롯 중복 장착 방지 (optic, muzzle, foregrip 등)
    price_krw integer not null check (price_krw >= 0),
    weight_grams integer not null check (weight_grams >= 0),
    image_url text,
    is_active boolean default true,
    environment_tags text[] default '{}', -- indoor, outdoor, shooting, cosplay
    style_tags text[] default '{}',       -- lightweight, balanced, appearance, budget
    priority_tags text[] default '{}',    -- appearance, weight, price, usability
    created_at timestamptz default now()
);

-- 4. 모델-부품 간 호환성 테이블 (model_accessory_compatibility)
-- 총기 모델과 부품 간의 물리적/규격상 장착 호환 여부를 관리합니다.
create table if not exists public.model_accessory_compatibility (
    model_id uuid references public.airsoft_models(id) on delete cascade,
    accessory_id uuid references public.accessories(id) on delete cascade,
    status text not null check (status in ('verified', 'unverified', 'incompatible')),
    evidence_note text,
    verified_at timestamptz default now(),
    primary key (model_id, accessory_id)
);

-- 5. 외부 이미지 검색 캐시 테이블 (image_search_cache)
-- 구글 API 호출 한도를 절약하고 응답 속도를 높이기 위해 검색 메타데이터를 캐시합니다.
create table if not exists public.image_search_cache (
    query_hash text primary key,
    results jsonb not null,
    expires_at timestamptz not null,
    created_at timestamptz default now()
);

-- 6. 조회 성능 최적화를 위한 인덱스 생성
create index if not exists idx_airsoft_models_platform_active on public.airsoft_models(platform, is_active);
create index if not exists idx_accessories_category_active on public.accessories(category, is_active);
create index if not exists idx_model_accessory_compatibility_status on public.model_accessory_compatibility(model_id, status);
create index if not exists idx_image_search_cache_expires on public.image_search_cache(expires_at);

-- 7. 강력한 보안: Row Level Security(RLS) 활성화
-- 외부 익명 사용자(브라우저)가 테이블을 직접 수정하거나 악의적으로 데이터를 변조할 수 없도록 차단합니다.
-- 백엔드 서버(service_role)를 통해서만 안전하게 데이터가 조회 및 관리됩니다.
alter table public.airsoft_models enable row level security;
alter table public.accessories enable row level security;
alter table public.model_accessory_compatibility enable row level security;
alter table public.image_search_cache enable row level security;

