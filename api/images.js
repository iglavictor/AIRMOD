/**
 * api/images.js
 * 
 * POST /api/images
 * 추천된 모딩 구성과 가장 유사한 인터넷 에어소프트 참고 이미지를 검색합니다.
 */

import { validateImagesRequest } from '../server/validation.js';
import { fetchAllModels, fetchAccessoriesForModel } from '../server/supabase.js';
import { searchSimilarAirsoftImages } from '../server/image-search.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'POST 요청만 지원합니다.' }
    });
  }

  const validation = validateImagesRequest(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error: { code: 'VALIDATION_FAILED', message: validation.error }
    });
  }

  const { modelId, accessoryIds } = validation.sanitizedData;

  try {
    const models = await fetchAllModels();
    const model = models.find(m => m.id === modelId || m.slug === modelId);

    if (!model) {
      return res.status(404).json({
        error: { code: 'MODEL_NOT_FOUND', message: '총기 모델을 찾을 수 없습니다.' }
      });
    }

    const allAccessories = await fetchAccessoriesForModel(model.id);
    const chosenAccessories = allAccessories.filter(a => accessoryIds.includes(a.id));

    const result = await searchSimilarAirsoftImages({
      modelName: model.name,
      accessories: chosenAccessories
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('[API /api/images] 오류:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '이미지 검색 중 오류가 발생했습니다.' }
    });
  }
}

