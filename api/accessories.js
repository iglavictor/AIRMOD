/**
 * api/accessories.js
 * 
 * GET /api/accessories?modelId=...
 * 선택된 모델에 장착 가능한 verified(검증된) 호환 액세서리 목록을 반환합니다.
 */

import { fetchAccessoriesForModel } from '../server/supabase.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'GET 요청만 지원합니다.' }
    });
  }

  const { modelId } = req.query;
  if (!modelId || typeof modelId !== 'string') {
    return res.status(400).json({
      error: { code: 'BAD_REQUEST', message: 'modelId 쿼리 파라미터가 필요합니다.' }
    });
  }

  try {
    const accessories = await fetchAccessoriesForModel(modelId);
    return res.status(200).json({ accessories });
  } catch (error) {
    console.error('[API /api/accessories] 오류:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '호환 부품 목록을 불러오는 중 오류가 발생했습니다.' }
    });
  }
}

