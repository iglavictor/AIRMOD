-- ==============================================================================
-- 003_update_model_images.sql
-- 깨진 외부 링크 대신 안정적인 로컬 전용 벡터 SVG 이미지 경로로 업데이트합니다.
-- ==============================================================================

update public.airsoft_models
set image_url = '/public/assets/model-m4.svg'
where slug = 'sample-m4-carbine';

update public.airsoft_models
set image_url = '/public/assets/model-ak47.svg'
where slug = 'sample-ak47-aeg';

update public.airsoft_models
set image_url = '/public/assets/model-g17.svg'
where slug = 'sample-g17-gbb';

