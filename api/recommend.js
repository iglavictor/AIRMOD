/**
 * api/recommend.js
 * 
 * POST /api/recommend
 * 사용자의 입력 조건(모델, 환경, 성향, 우선순위, 예산, 선택 부품)을 바탕으로
 * 최적의 호환 외장 모딩 구성을 계산하고 AI/규칙 설명을 함께 반환합니다.
 */

import { validateRecommendRequest } from '../server/validation.js';
import { fetchAllModels, fetchAccessoriesForModel } from '../server/supabase.js';
import { calculateRecommendation } from '../server/recommender.js';
import { generateRecommendationExplanation } from '../server/ai.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: { code: 'METHOD_NOT_ALLOWED', message: 'POST 요청만 지원합니다.' }
    });
  }

  // 1. 요청 본문 검증
  const validation = validateRecommendRequest(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      error: { code: 'VALIDATION_FAILED', message: validation.error }
    });
  }

  const { modelId, environment, style, priority, budgetKRW, selectedAccessoryIds } = validation.sanitizedData;

  try {
    // 2. 모델 및 호환 부품 정보 조회
    const models = await fetchAllModels();
    const model = models.find(m => m.id === modelId || m.slug === modelId);

    if (!model) {
      return res.status(404).json({
        error: { code: 'MODEL_NOT_FOUND', message: '선택하신 총기 모델을 찾을 수 없습니다.' }
      });
    }

    const compatibleAccessories = await fetchAccessoriesForModel(model.id);

    // 3. 추천 계산 엔진 실행
    const result = calculateRecommendation({
      model,
      compatibleAccessories,
      environment,
      style,
      priority,
      budgetKRW,
      selectedAccessoryIds
    });

    if (!result.success) {
      return res.status(422).json({
        error: { code: result.errorReason, message: result.message }
      });
    }

    // 4. OpenAI / 규칙 템플릿 기반 설명 생성
    const explanation = await generateRecommendationExplanation({
      modelName: model.name,
      environment,
      style,
      priority,
      accessories: result.accessories,
      totalPriceKRW: result.totalPriceKRW,
      totalWeightGrams: result.totalWeightGrams
    });

    // 5. 최종 응답 반환
    return res.status(200).json({
      modelId: model.id,
      model,
      accessories: result.accessories,
      basePriceKRW: result.basePriceKRW,
      totalPriceKRW: result.totalPriceKRW,
      totalWeightGrams: result.totalWeightGrams,
      fitScore: result.fitScore,
      reason: explanation.reason,
      pros: explanation.pros,
      cons: explanation.cons,
      explanationSource: explanation.explanationSource
    });
  } catch (error) {
    console.error('[API /api/recommend] 내부 오류:', error);
    return res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: '추천을 계산하는 도중 서버 오류가 발생했습니다.' }
    });
  }
}

