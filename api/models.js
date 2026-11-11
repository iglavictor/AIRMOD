/**
 * api/models.js
 * 
 * GET /api/models
 * 선택 가능한 모든 에어소프트건 기본 모델 목록을 반환합니다.
 */

import { fetchAllModels } from '../server/supabase.js';

export default async function handler(req, res) {
  // CORS 및 메서드 제어
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'GET 요청만 지원합니다.' }
    });
  }

  try {
    const models = await fetchAllModels();
    return res.status(200).json({ models });
  } catch (error) {
    console.error('[API /api/models] 오류:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '총기 모델 목록을 불러오는 중 오류가 발생했습니다.' }
    });
  }
}

