-- ==============================================================================
-- 004_rename_ak47_to_akm_and_set_user_images.sql
-- 1. AK-47 모델명을 'AKM'으로 변경하고 슬러그 및 이미지를 업데이트합니다.
-- 2. 글록 17, AKM, M4A1의 이미지를 고화질 실사 이미지로 일괄 적용합니다.
-- ==============================================================================

-- 1. M4A1 카빈 이미지 업데이트
update public.airsoft_models
set 
  name = '[샘플] M4A1 카빈 전동 에어소프트건',
  image_url = '/public/assets/model-m4a1.jpg'
where slug = 'sample-m4-carbine';

-- 2. AK-47을 AKM으로 이름, 슬러그, 이미지 변경
update public.airsoft_models
set 
  name = '[샘플] AKM 전동 에어소프트건',
  slug = 'sample-akm-aeg',
  image_url = '/public/assets/model-akm.jpg'
where slug in ('sample-ak47-aeg', 'sample-akm-aeg');

-- 3. 글록 17 핸드건 이름 및 이미지 변경
update public.airsoft_models
set 
  name = '[샘플] 글록 17 (G17) 가스블로우백 핸드건',
  image_url = '/public/assets/model-g17.jpg'
where slug = 'sample-g17-gbb';

