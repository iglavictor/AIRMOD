-- ==============================================================================
-- 002_seed_data.sql
-- AIRMOD 가상 에어소프트건 모델 및 외장 부품 시드 데이터 (초기 데이터)
-- 
-- 주의: 본 데이터는 시스템 기능 시연 및 테스트를 위한 '가상 예시' 데이터입니다.
-- 실제 총기나 실제 판매 제품의 가격/스펙이 아닙니다.
-- ==============================================================================

-- 1. 기본 모델 3종 등록 (서로 다른 3개 플랫폼: AR-15, AK, Handgun)
insert into public.airsoft_models (slug, name, manufacturer, platform, price_krw, weight_grams, image_url, is_active)
values
  (
    'sample-m4-carbine',
    '[샘플] M4A1 카빈 전동 에어소프트건',
    '가상 에어로랩',
    'AR-15',
    350000,
    2500,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    true
  ),
  (
    'sample-ak47-aeg',
    '[샘플] AK-47 택티컬 전동 에어소프트건',
    '가상 택티컬기어',
    'AK',
    320000,
    3100,
    'https://images.unsplash.com/photo-1584281722573-982eb98b0fd2?auto=format&fit=crop&w=800&q=80',
    true
  ),
  (
    'sample-g17-gbb',
    '[샘플] G17 가스블로우백 핸드건',
    '가상 프라임에어소프트',
    'Handgun',
    180000,
    750,
    'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=800&q=80',
    true
  )
on conflict (slug) do update set
  name = excluded.name,
  manufacturer = excluded.manufacturer,
  platform = excluded.platform,
  price_krw = excluded.price_krw,
  weight_grams = excluded.weight_grams,
  image_url = excluded.image_url,
  is_active = excluded.is_active;

-- 2. 외장 액세서리 13종 등록 (광학장비, 소음기 모형, 그립, 라이트 모형, 슬링, 스톡 등)
insert into public.accessories (
  slug, name, manufacturer, category, slot, price_krw, weight_grams, image_url, is_active,
  environment_tags, style_tags, priority_tags
)
values
  -- [광학장비 - optic 슬롯]
  (
    'sample-red-dot-sight',
    '[샘플] 컴팩트 마이크로 레드 도트사이트 모형',
    '가상 옵틱스랩',
    'optic',
    'optic',
    65000,
    130,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'shooting'],
    array['lightweight', 'balanced', 'budget'],
    array['weight', 'usability', 'price']
  ),
  (
    'sample-holo-sight',
    '[샘플] 홀로그래픽 스타일 외장 조준기 모형',
    '가상 텍비전',
    'optic',
    'optic',
    115000,
    260,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['outdoor', 'cosplay'],
    array['appearance', 'balanced'],
    array['appearance', 'usability']
  ),
  (
    'sample-pistol-reflex',
    '[샘플] 핸드건 전용 마이크로 오픈 도트',
    '가상 미니옵틱스',
    'optic',
    'optic',
    55000,
    70,
    'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'shooting'],
    array['lightweight', 'budget'],
    array['weight', 'price']
  ),

  -- [총구 장식물 - muzzle 슬롯]
  (
    'sample-dummy-suppressor-short',
    '[샘플] 외장형 알루미늄 더미 소음기 숏',
    '가상 머즐웍스',
    'muzzle',
    'muzzle',
    42000,
    150,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'cosplay'],
    array['appearance', 'balanced'],
    array['appearance', 'weight']
  ),
  (
    'sample-dummy-suppressor-long',
    '[샘플] 택티컬 롱 더미 소음기 외장 커버',
    '가상 머즐웍스',
    'muzzle',
    'muzzle',
    58000,
    240,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['outdoor', 'cosplay'],
    array['appearance'],
    array['appearance']
  ),
  (
    'sample-compensator-pistol',
    '[샘플] 핸드건용 알루미늄 컴펜세이터 모형',
    '가상 프라임커스텀',
    'muzzle',
    'muzzle',
    35000,
    60,
    'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=400&q=80',
    true,
    array['shooting', 'cosplay'],
    array['appearance', 'budget'],
    array['appearance', 'price']
  ),

  -- [전방 손잡이 - foregrip 슬롯]
  (
    'sample-vertical-foregrip',
    '[샘플] 경량형 수직 포어그립',
    '가상 그립텍',
    'grip',
    'foregrip',
    24000,
    85,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'outdoor'],
    array['lightweight', 'budget'],
    array['usability', 'weight', 'price']
  ),
  (
    'sample-angled-foregrip',
    '[샘플] 인체공학 앵글 포어그립',
    '가상 그립텍',
    'grip',
    'foregrip',
    29000,
    95,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'outdoor', 'shooting'],
    array['balanced', 'appearance'],
    array['usability', 'appearance']
  ),
  (
    'sample-handstop',
    '[샘플] 초경량 알루미늄 핸드스톱',
    '가상 에어로라이트',
    'grip',
    'foregrip',
    21000,
    35,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'shooting'],
    array['lightweight'],
    array['weight', 'usability']
  ),

  -- [조명 장비 모형 - flashlight 슬롯]
  (
    'sample-tactical-weapon-light',
    '[샘플] 20mm 레일용 택티컬 웨폰라이트 모형',
    '가상 빔텍',
    'light',
    'flashlight',
    48000,
    110,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'cosplay'],
    array['appearance', 'balanced'],
    array['appearance', 'usability']
  ),
  (
    'sample-pistol-under-light',
    '[샘플] 핸드건 언더레일 컴팩트 라이트 모형',
    '가상 빔텍',
    'light',
    'flashlight',
    39000,
    65,
    'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'cosplay'],
    array['appearance', 'budget'],
    array['usability', 'price']
  ),

  -- [멜빵 / 슬링 - sling 슬롯]
  (
    'sample-tactical-2point-sling',
    '[샘플] 신속조절형 2포인트 택티컬 슬링',
    '가상 기어팩토리',
    'sling',
    'sling',
    26000,
    140,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['outdoor', 'shooting'],
    array['balanced', 'budget'],
    array['usability', 'price']
  ),

  -- [개머리판 - stock 슬롯]
  (
    'sample-lightweight-stock',
    '[샘플] M4 스톡봉 호환 경량형 스톡',
    '가상 에어로랩',
    'stock',
    'stock',
    52000,
    210,
    'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    true,
    array['indoor', 'outdoor'],
    array['lightweight', 'appearance'],
    array['weight', 'appearance']
  )
on conflict (slug) do update set
  name = excluded.name,
  manufacturer = excluded.manufacturer,
  category = excluded.category,
  slot = excluded.slot,
  price_krw = excluded.price_krw,
  weight_grams = excluded.weight_grams,
  image_url = excluded.image_url,
  is_active = excluded.is_active,
  environment_tags = excluded.environment_tags,
  style_tags = excluded.style_tags,
  priority_tags = excluded.priority_tags;

-- 3. 모델-부품 간 호환성(Compatibility) 매핑 등록
-- (1) M4A1 카빈 호환성 (20mm 피카티니 레일 및 M4 스톡봉 기준)
insert into public.model_accessory_compatibility (model_id, accessory_id, status, evidence_note)
select m.id, a.id, 'verified', '상부 및 핸드가드 20mm 레일/스톡봉 장착 확인'
from public.airsoft_models m, public.accessories a
where m.slug = 'sample-m4-carbine'
  and a.slug in (
    'sample-red-dot-sight',
    'sample-holo-sight',
    'sample-dummy-suppressor-short',
    'sample-dummy-suppressor-long',
    'sample-vertical-foregrip',
    'sample-angled-foregrip',
    'sample-handstop',
    'sample-tactical-weapon-light',
    'sample-tactical-2point-sling',
    'sample-lightweight-stock'
  )
on conflict (model_id, accessory_id) do update set
  status = excluded.status,
  evidence_note = excluded.evidence_note;

-- (2) AK-47 택티컬 호환성
insert into public.model_accessory_compatibility (model_id, accessory_id, status, evidence_note)
select m.id, a.id, 'verified', 'AK 택티컬 핸드가드 레일 및 14mm 역나사 소음기 장착 확인'
from public.airsoft_models m, public.accessories a
where m.slug = 'sample-ak47-aeg'
  and a.slug in (
    'sample-red-dot-sight',
    'sample-dummy-suppressor-short',
    'sample-dummy-suppressor-long',
    'sample-vertical-foregrip',
    'sample-angled-foregrip',
    'sample-tactical-weapon-light',
    'sample-tactical-2point-sling'
  )
on conflict (model_id, accessory_id) do update set
  status = excluded.status,
  evidence_note = excluded.evidence_note;

-- (3) G17 핸드건 호환성
insert into public.model_accessory_compatibility (model_id, accessory_id, status, evidence_note)
select m.id, a.id, 'verified', '핸드건 슬라이드 컷 및 하부 언더레일 규격 호환 확인'
from public.airsoft_models m, public.accessories a
where m.slug = 'sample-g17-gbb'
  and a.slug in (
    'sample-pistol-reflex',
    'sample-compensator-pistol',
    'sample-pistol-under-light'
  )
on conflict (model_id, accessory_id) do update set
  status = excluded.status,
  evidence_note = excluded.evidence_note;

-- (4) 테스트 검증용 미호환(incompatible) 관계 등록 (예: 핸드건 전용 부품을 소총에 달거나, 소총 부품을 권총에 다는 경우)
insert into public.model_accessory_compatibility (model_id, accessory_id, status, evidence_note)
select m.id, a.id, 'incompatible', '핸드건 규격 불일치로 장착 불가 (테스트용 검증 데이터)'
from public.airsoft_models m, public.accessories a
where m.slug = 'sample-g17-gbb'
  and a.slug in ('sample-lightweight-stock', 'sample-vertical-foregrip')
on conflict (model_id, accessory_id) do update set
  status = excluded.status,
  evidence_note = excluded.evidence_note;

-- (5) 테스트 검증용 미확인(unverified) 관계 등록
insert into public.model_accessory_compatibility (model_id, accessory_id, status, evidence_note)
select m.id, a.id, 'unverified', '장착 가능 여부 미검증 상태 (테스트용)'
from public.airsoft_models m, public.accessories a
where m.slug = 'sample-ak47-aeg'
  and a.slug in ('sample-holo-sight', 'sample-handstop')
on conflict (model_id, accessory_id) do update set
  status = excluded.status,
  evidence_note = excluded.evidence_note;

