/**
 * server/supabase.js
 * 
 * Supabase 데이터베이스와의 통신을 안전하게 관리하는 백엔드 전용 모듈입니다.
 * 
 * 주요 특징 및 보안 원칙:
 * 1. SUPABASE_SERVICE_ROLE_KEY를 사용하여 관리자 권한으로 안전하게 접근합니다.
 *    (이 키는 브라우저에 절대 노출되지 않고 오직 서버에서만 동작합니다)
 * 2. 만약 Supabase 키가 설정되지 않았거나 연결이 불가능한 경우에도,
 *    테스트가 중단되지 않도록 가상 메모리 시드 데이터(Mock)로 자동 전환(Fallback)됩니다.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env 환경변수 로드
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// 유효한 Supabase URL 및 키인지 기본 확인
const isConfigured = 
  SUPABASE_URL.startsWith('http') && 
  SUPABASE_SERVICE_ROLE_KEY && 
  !SUPABASE_SERVICE_ROLE_KEY.includes('your_supabase_service_role_key_here');

export const supabaseClient = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

/**
 * DB 연결 상태를 확인하고 클라이언트를 반환합니다.
 */
export function getSupabase() {
  return supabaseClient;
}

// ==============================================================================
// 비상용 / 로컬 테스트용 인메모리 목업(Mock) 데이터
// Supabase 서버가 아직 설정되지 않았을 때도 모든 기능을 체험할 수 있도록 지원합니다.
// ==============================================================================
export const MOCK_MODELS = [
  {
    id: 'm4-carbine-001',
    slug: 'sample-m4-carbine',
    name: '[샘플] M4A1 카빈 전동 에어소프트건',
    manufacturer: '가상 에어로랩',
    platform: 'AR-15',
    price_krw: 350000,
    weight_grams: 2500,
    image_url: '/public/assets/model-m4a1.jpg',
    is_active: true
  },
  {
    id: 'akm-aeg-002',
    slug: 'sample-akm-aeg',
    name: '[샘플] AKM 전동 에어소프트건',
    manufacturer: '가상 택티컬기어',
    platform: 'AK',
    price_krw: 320000,
    weight_grams: 3100,
    image_url: '/public/assets/model-akm.jpg',
    is_active: true
  },
  {
    id: 'g17-gbb-003',
    slug: 'sample-g17-gbb',
    name: '[샘플] 글록 17 (G17) 가스블로우백 핸드건',
    manufacturer: '가상 프라임에어소프트',
    platform: 'Handgun',
    price_krw: 180000,
    weight_grams: 750,
    image_url: '/public/assets/model-g17.jpg',
    is_active: true
  },
  {
    id: 'mp5-aeg-004',
    slug: 'sample-mp5-aeg',
    name: '[샘플] H&K MP5A5 기관단총 전동건',
    manufacturer: '가상 택티컬암즈',
    platform: 'SMG',
    price_krw: 290000,
    weight_grams: 2100,
    image_url: '/public/assets/model-mp5.jpg',
    is_active: true
  }
];

export const MOCK_ACCESSORIES = [
  {
    id: 'acc-red-dot',
    slug: 'sample-red-dot-sight',
    name: '[샘플] 컴팩트 마이크로 레드 도트사이트 모형',
    manufacturer: '가상 옵틱스랩',
    category: 'optic',
    slot: 'optic',
    price_krw: 65000,
    weight_grams: 130,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'shooting'],
    style_tags: ['lightweight', 'balanced', 'budget'],
    priority_tags: ['weight', 'usability', 'price']
  },
  {
    id: 'acc-holo-sight',
    slug: 'sample-holo-sight',
    name: '[샘플] 홀로그래픽 스타일 외장 조준기 모형',
    manufacturer: '가상 텍비전',
    category: 'optic',
    slot: 'optic',
    price_krw: 115000,
    weight_grams: 260,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['outdoor', 'cosplay'],
    style_tags: ['appearance', 'balanced'],
    priority_tags: ['appearance', 'usability']
  },
  {
    id: 'acc-pistol-reflex',
    slug: 'sample-pistol-reflex',
    name: '[샘플] 핸드건 전용 마이크로 오픈 도트',
    manufacturer: '가상 미니옵틱스',
    category: 'optic',
    slot: 'optic',
    price_krw: 55000,
    weight_grams: 70,
    image_url: 'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'shooting'],
    style_tags: ['lightweight', 'budget'],
    priority_tags: ['weight', 'price']
  },
  {
    id: 'acc-suppressor-short',
    slug: 'sample-dummy-suppressor-short',
    name: '[샘플] 외장형 알루미늄 더미 소음기 숏',
    manufacturer: '가상 머즐웍스',
    category: 'muzzle',
    slot: 'muzzle',
    price_krw: 42000,
    weight_grams: 150,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'cosplay'],
    style_tags: ['appearance', 'balanced'],
    priority_tags: ['appearance', 'weight']
  },
  {
    id: 'acc-suppressor-long',
    slug: 'sample-dummy-suppressor-long',
    name: '[샘플] 택티컬 롱 더미 소음기 외장 커버',
    manufacturer: '가상 머즐웍스',
    category: 'muzzle',
    slot: 'muzzle',
    price_krw: 58000,
    weight_grams: 240,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['outdoor', 'cosplay'],
    style_tags: ['appearance'],
    priority_tags: ['appearance']
  },
  {
    id: 'acc-compensator-pistol',
    slug: 'sample-compensator-pistol',
    name: '[샘플] 핸드건용 알루미늄 컴펜세이터 모형',
    manufacturer: '가상 프라임커스텀',
    category: 'muzzle',
    slot: 'muzzle',
    price_krw: 35000,
    weight_grams: 60,
    image_url: 'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['shooting', 'cosplay'],
    style_tags: ['appearance', 'budget'],
    priority_tags: ['appearance', 'price']
  },
  {
    id: 'acc-vertical-grip',
    slug: 'sample-vertical-foregrip',
    name: '[샘플] 경량형 수직 포어그립',
    manufacturer: '가상 그립텍',
    category: 'grip',
    slot: 'foregrip',
    price_krw: 24000,
    weight_grams: 85,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'outdoor'],
    style_tags: ['lightweight', 'budget'],
    priority_tags: ['usability', 'weight', 'price']
  },
  {
    id: 'acc-angled-grip',
    slug: 'sample-angled-foregrip',
    name: '[샘플] 인체공학 앵글 포어그립',
    manufacturer: '가상 그립텍',
    category: 'grip',
    slot: 'foregrip',
    price_krw: 29000,
    weight_grams: 95,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'outdoor', 'shooting'],
    style_tags: ['balanced', 'appearance'],
    priority_tags: ['usability', 'appearance']
  },
  {
    id: 'acc-handstop',
    slug: 'sample-handstop',
    name: '[샘플] 초경량 알루미늄 핸드스톱',
    manufacturer: '가상 에어로라이트',
    category: 'grip',
    slot: 'foregrip',
    price_krw: 21000,
    weight_grams: 35,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'shooting'],
    style_tags: ['lightweight'],
    priority_tags: ['weight', 'usability']
  },
  {
    id: 'acc-weapon-light',
    slug: 'sample-tactical-weapon-light',
    name: '[샘플] 20mm 레일용 택티컬 웨폰라이트 모형',
    manufacturer: '가상 빔텍',
    category: 'light',
    slot: 'flashlight',
    price_krw: 48000,
    weight_grams: 110,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'cosplay'],
    style_tags: ['appearance', 'balanced'],
    priority_tags: ['appearance', 'usability']
  },
  {
    id: 'acc-pistol-light',
    slug: 'sample-pistol-under-light',
    name: '[샘플] 핸드건 언더레일 컴팩트 라이트 모형',
    manufacturer: '가상 빔텍',
    category: 'light',
    slot: 'flashlight',
    price_krw: 39000,
    weight_grams: 65,
    image_url: 'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'cosplay'],
    style_tags: ['appearance', 'budget'],
    priority_tags: ['usability', 'price']
  },
  {
    id: 'acc-tactical-sling',
    slug: 'sample-tactical-2point-sling',
    name: '[샘플] 신속조절형 2포인트 택티컬 슬링',
    manufacturer: '가상 기어팩토리',
    category: 'sling',
    slot: 'sling',
    price_krw: 26000,
    weight_grams: 140,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['outdoor', 'shooting'],
    style_tags: ['balanced', 'budget'],
    priority_tags: ['usability', 'price']
  },
  {
    id: 'acc-light-stock',
    slug: 'sample-lightweight-stock',
    name: '[샘플] M4 스톡봉 호환 경량형 스톡',
    manufacturer: '가상 에어로랩',
    category: 'stock',
    slot: 'stock',
    price_krw: 52000,
    weight_grams: 210,
    image_url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=400&q=80',
    is_active: true,
    environment_tags: ['indoor', 'outdoor'],
    style_tags: ['lightweight', 'appearance'],
    priority_tags: ['weight', 'appearance']
  }
];

export const MOCK_COMPATIBILITY = [
  // M4A1 카빈 호환 부품들
  { modelId: 'm4-carbine-001', accessoryId: 'acc-red-dot', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-holo-sight', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-suppressor-short', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-suppressor-long', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-vertical-grip', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-angled-grip', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-handstop', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-weapon-light', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-tactical-sling', status: 'verified' },
  { modelId: 'm4-carbine-001', accessoryId: 'acc-light-stock', status: 'verified' },

  // AKM 호환 부품들
  { modelId: 'akm-aeg-002', accessoryId: 'acc-red-dot', status: 'verified' },
  { modelId: 'akm-aeg-002', accessoryId: 'acc-suppressor-short', status: 'verified' },
  { modelId: 'akm-aeg-002', accessoryId: 'acc-suppressor-long', status: 'verified' },
  { modelId: 'akm-aeg-002', accessoryId: 'acc-vertical-grip', status: 'verified' },
  { modelId: 'akm-aeg-002', accessoryId: 'acc-angled-grip', status: 'verified' },
  { modelId: 'akm-aeg-002', accessoryId: 'acc-weapon-light', status: 'verified' },
  { modelId: 'akm-aeg-002', accessoryId: 'acc-tactical-sling', status: 'verified' },

  // 기존 호환성 유지용 (AK-47)
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-red-dot', status: 'verified' },
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-suppressor-short', status: 'verified' },
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-suppressor-long', status: 'verified' },
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-vertical-grip', status: 'verified' },
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-angled-grip', status: 'verified' },
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-weapon-light', status: 'verified' },
  { modelId: 'ak47-aeg-002', accessoryId: 'acc-tactical-sling', status: 'verified' },

  // G17 핸드건 호환 부품들
  { modelId: 'g17-gbb-003', accessoryId: 'acc-pistol-reflex', status: 'verified' },
  { modelId: 'g17-gbb-003', accessoryId: 'acc-compensator-pistol', status: 'verified' },
  { modelId: 'g17-gbb-003', accessoryId: 'acc-pistol-light', status: 'verified' },

  // H&K MP5 호환 부품들
  { modelId: 'mp5-aeg-004', accessoryId: 'acc-red-dot', status: 'verified' },
  { modelId: 'mp5-aeg-004', accessoryId: 'acc-suppressor-short', status: 'verified' },
  { modelId: 'mp5-aeg-004', accessoryId: 'acc-weapon-light', status: 'verified' },
  { modelId: 'mp5-aeg-004', accessoryId: 'acc-tactical-sling', status: 'verified' }
];

/**
 * 모델별 고화질 실사 이미지 및 한국어 표준 명칭 매핑 유틸리티
 */
function normalizeModelInfo(item) {
  const text = `${item.slug || ''} ${item.name || ''} ${item.platform || ''}`.toLowerCase();
  let imageUrl = item.image_url;
  let name = item.name;

  if (text.includes('m4') || text.includes('ar-15')) {
    imageUrl = '/public/assets/model-m4a1.jpg';
    name = '[샘플] M4A1 카빈 전동 에어소프트건';
  } else if (text.includes('ak')) {
    imageUrl = '/public/assets/model-akm.jpg';
    name = '[샘플] AKM 전동 에어소프트건';
  } else if (text.includes('g17') || text.includes('글록') || text.includes('handgun') || text.includes('핸드건')) {
    imageUrl = '/public/assets/model-g17.jpg';
    name = '[샘플] 글록 17 (G17) 가스블로우백 핸드건';
  } else if (text.includes('mp5')) {
    imageUrl = '/public/assets/model-mp5.jpg';
    name = '[샘플] H&K MP5A5 기관단총 전동건';
  }

  return { imageUrl, name };
}

/**
 * 기본 모델 목록 조회 (DB 우선, 실패 시 목업 데이터 제공)
 */
export async function fetchAllModels() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('airsoft_models')
        .select('*')
        .eq('is_active', true)
        .order('price_krw', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map(item => {
          const { imageUrl, name } = normalizeModelInfo(item);
          return {
            id: item.id,
            slug: item.slug,
            name: name,
            manufacturer: item.manufacturer,
            platform: item.platform,
            priceKRW: item.price_krw,
            weightGrams: item.weight_grams,
            imageUrl: imageUrl
          };
        });
      }
    } catch (e) {
      console.warn('[DB] Supabase 조회 실패, 가상 데이터로 대체합니다:', e.message);
    }
  }

  // 폴백: 목업 데이터 반환
  return MOCK_MODELS.map(item => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    manufacturer: item.manufacturer,
    platform: item.platform,
    priceKRW: item.price_krw,
    weightGrams: item.weight_grams,
    imageUrl: item.image_url
  }));
}

/**
 * 특정 모델에 호환되는 액세서리 목록 조회
 */
export async function fetchAccessoriesForModel(modelId) {
  if (supabaseClient) {
    try {
      // 1. 호환성 테이블에서 verified 상태인 부품 ID 목록 조회
      const { data: compData, error: compErr } = await supabaseClient
        .from('model_accessory_compatibility')
        .select('accessory_id, status')
        .eq('model_id', modelId)
        .eq('status', 'verified');

      if (!compErr && compData && compData.length > 0) {
        const accessoryIds = compData.map(c => c.accessory_id);
        const { data: accData, error: accErr } = await supabaseClient
          .from('accessories')
          .select('*')
          .in('id', accessoryIds)
          .eq('is_active', true);

        if (!accErr && accData) {
          return accData.map(item => ({
            id: item.id,
            name: item.name,
            manufacturer: item.manufacturer,
            category: item.category,
            slot: item.slot,
            priceKRW: item.price_krw,
            weightGrams: item.weight_grams,
            imageUrl: item.image_url,
            compatibilityStatus: 'verified',
            environmentTags: item.environment_tags || [],
            styleTags: item.style_tags || [],
            priorityTags: item.priority_tags || []
          }));
        }
      }
    } catch (e) {
      console.warn('[DB] 호환성 조회 실패, 가상 데이터로 대체합니다:', e.message);
    }
  }

  // 폴백: 목업 호환성 데이터 조회
  const verifiedComp = MOCK_COMPATIBILITY.filter(
    c => (c.modelId === modelId || c.modelId.includes(modelId)) && c.status === 'verified'
  );
  const verifiedIds = new Set(verifiedComp.map(c => c.accessoryId));

  return MOCK_ACCESSORIES
    .filter(acc => verifiedIds.has(acc.id))
    .map(acc => ({
      id: acc.id,
      name: acc.name,
      manufacturer: acc.manufacturer,
      category: acc.category,
      slot: acc.slot,
      priceKRW: acc.price_krw,
      weightGrams: acc.weight_grams,
      imageUrl: acc.image_url,
      compatibilityStatus: 'verified',
      environmentTags: acc.environment_tags,
      styleTags: acc.style_tags,
      priorityTags: acc.priority_tags
    }));
}

