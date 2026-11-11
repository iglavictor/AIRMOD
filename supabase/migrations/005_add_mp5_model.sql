-- ==============================================================================
-- 005_add_mp5_model.sql
-- H&K MP5A5 기관단총 모델 및 호환 외장 부품 매핑 추가
-- ==============================================================================

-- 1. H&K MP5A5 기본 모델 등록
insert into public.airsoft_models (slug, name, manufacturer, platform, price_krw, weight_grams, image_url, is_active)
values
  (
    'sample-mp5-aeg',
    '[샘플] H&K MP5A5 기관단총 전동건',
    '가상 택티컬암즈',
    'SMG',
    290000,
    2100,
    '/public/assets/model-mp5.jpg',
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

-- 2. H&K MP5A5 호환 외장 부품 (verified) 매핑 등록
-- (상부 로우마운트 도트, 14mm 역나사 숏 소음기, 핸드가드 라이트, 2포인트 슬링 호환)
insert into public.model_accessory_compatibility (model_id, accessory_id, status, evidence_note)
select m.id, a.id, 'verified', 'MP5 상부 레일 마운트 및 14mm 역나사 총구/슬링고리 장착 확인'
from public.airsoft_models m, public.accessories a
where m.slug = 'sample-mp5-aeg'
  and a.slug in (
    'sample-red-dot-sight',
    'sample-dummy-suppressor-short',
    'sample-tactical-weapon-light',
    'sample-tactical-2point-sling'
  )
on conflict (model_id, accessory_id) do update set
  status = excluded.status,
  evidence_note = excluded.evidence_note;
