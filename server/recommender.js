/**
 * server/recommender.js
 * 
 * AIRMOD의 핵심 비즈니스 로직인 '외장 모딩 추천 엔진'입니다.
 * 
 * 주요 원칙 (PRD 제4조 추천 규칙 준수):
 * 1. verified 호환 부품만 후보로 사용.
 * 2. 예산(budgetKRW)은 모델 기본 가격을 포함. 예산 부족 시 정직하게 안내.
 * 3. 슬롯(slot)별 최대 1개 장착. 중복 슬롯 방지.
 * 4. 점수 가중치 공식:
 *    fitScore = Math.round(0.30*envScore + 0.25*styleScore + 0.25*budgetScore + 0.20*priorityScore)
 * 5. 동일 조건 입력 시 항상 동일한 결과를 반환(결정론적 알고리즘).
 */

/**
 * 부품 1개의 조건별 적합도 점수를 채점합니다 (0 ~ 100점).
 */
export function scoreAccessory(acc, { environment, style, priority }) {
  // 1. 사용 환경(environment) 점수 (30% 반영)
  const envScore = acc.environmentTags?.includes(environment) ? 100 : 30;

  // 2. 모딩 성향(style) 점수 (25% 반영)
  const styleScore = acc.styleTags?.includes(style) ? 100 : 30;

  // 3. 사용자 우선순위(priority) 점수 (20% 반영)
  const priorityScore = acc.priorityTags?.includes(priority) ? 100 : 30;

  // 4. 예산 점수 (기본 100점, 최종 조합에서 예산 초과 여부로 탈락 결정)
  const budgetScore = 100;

  // 가중치 합산 점수
  const totalScore = (0.30 * envScore) + (0.25 * styleScore) + (0.25 * budgetScore) + (0.20 * priorityScore);

  return {
    rawScore: Math.round(totalScore),
    envScore,
    styleScore,
    priorityScore
  };
}

/**
 * 추천 조합 알고리즘 실행 함수
 * 
 * @param {object} params
 * @param {object} params.model - 선택된 기본 모델 객체
 * @param {Array} params.compatibleAccessories - verified 호환성이 검증된 부품 목록
 * @param {string} params.environment - 실내(indoor), 야외(outdoor) 등
 * @param {string} params.style - 경량(lightweight), 가성비(budget) 등
 * @param {string} params.priority - 외관(appearance), 무게(weight) 등
 * @param {number} params.budgetKRW - 사용자 설정 예산 (원)
 * @param {Array<string>} [params.selectedAccessoryIds] - 사용자가 수동 선택/교체한 부품 ID 목록
 */
export function calculateRecommendation({
  model,
  compatibleAccessories = [],
  environment,
  style,
  priority,
  budgetKRW,
  selectedAccessoryIds = []
}) {
  const basePriceKRW = model.priceKRW;
  const baseWeightGrams = model.weightGrams;

  // 1. 기본 모델 가격이 사용자의 총 예산보다 큰 경우 추천 불가
  if (budgetKRW < basePriceKRW) {
    return {
      success: false,
      errorReason: 'budget_exceeded_base_model',
      message: `선택하신 총기 기본 가격(${basePriceKRW.toLocaleString('ko-KR')}원)이 설정하신 예산(${budgetKRW.toLocaleString('ko-KR')}원)을 초과하여 추천을 진행할 수 없습니다. 예산을 늘려주세요.`,
      basePriceKRW,
      totalPriceKRW: basePriceKRW,
      totalWeightGrams: baseWeightGrams,
      accessories: [],
      fitScore: 0
    };
  }

  // 2. 사용자가 수동으로 부품을 지정한 경우 (FR-11: 부품 교체 시 즉시 재계산)
  if (Array.isArray(selectedAccessoryIds) && selectedAccessoryIds.length > 0) {
    const chosenSet = new Set(selectedAccessoryIds);
    const chosenAccessories = compatibleAccessories.filter(a => chosenSet.has(a.id));

    let accessoryPriceSum = 0;
    let accessoryWeightSum = 0;
    let scoreSum = 0;

    for (const acc of chosenAccessories) {
      accessoryPriceSum += acc.priceKRW;
      accessoryWeightSum += acc.weightGrams;
      const { rawScore } = scoreAccessory(acc, { environment, style, priority });
      scoreSum += rawScore;
    }

    const totalPriceKRW = basePriceKRW + accessoryPriceSum;
    const totalWeightGrams = baseWeightGrams + accessoryWeightSum;
    const avgScore = chosenAccessories.length > 0 
      ? Math.round(scoreSum / chosenAccessories.length) 
      : 80;

    return {
      success: true,
      modelId: model.id,
      basePriceKRW,
      totalPriceKRW,
      totalWeightGrams,
      fitScore: Math.min(100, avgScore),
      accessories: chosenAccessories,
      isManualSelection: true
    };
  }

  // 3. 자동 추천 모드: 슬롯별로 후보를 그룹화하고 최적의 부품 선별
  const availableBudgetForAccessories = budgetKRW - basePriceKRW;

  // 슬롯별로 부품 분류
  const slotMap = new Map();
  for (const acc of compatibleAccessories) {
    const slot = acc.slot || acc.category;
    if (!slotMap.has(slot)) {
      slotMap.set(slot, []);
    }

    const { rawScore } = scoreAccessory(acc, { environment, style, priority });
    slotMap.get(slot).push({
      ...acc,
      fitScore: rawScore
    });
  }

  // 각 슬롯 내에서 점수 높은 순 -> 가격 낮은 순 -> ID 오름차순으로 정렬
  for (const list of slotMap.values()) {
    list.sort((a, b) => {
      if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore;
      if (a.priceKRW !== b.priceKRW) return a.priceKRW - b.priceKRW;
      return String(a.id).localeCompare(String(b.id));
    });
  }

  // 슬롯 우선순위 (광학장비 -> 손잡이 -> 총구장식 -> 라이트 -> 슬링 -> 개머리판 순서로 예산 배분)
  const slotOrder = ['optic', 'foregrip', 'muzzle', 'flashlight', 'sling', 'stock'];
  const recommendedAccessories = [];
  let currentAccessoryCost = 0;
  let totalAccessoryWeight = 0;
  let totalScoreSum = 0;

  for (const slot of slotOrder) {
    const candidates = slotMap.get(slot);
    if (!candidates || candidates.length === 0) continue;

    // 남은 예산 내에서 가장 점수가 높은 부품 1개 선택
    for (const item of candidates) {
      if (currentAccessoryCost + item.priceKRW <= availableBudgetForAccessories) {
        recommendedAccessories.push(item);
        currentAccessoryCost += item.priceKRW;
        totalAccessoryWeight += item.weightGrams;
        totalScoreSum += item.fitScore;
        break; // 슬롯당 1개만 선택
      }
    }
  }

  const totalPriceKRW = basePriceKRW + currentAccessoryCost;
  const totalWeightGrams = baseWeightGrams + totalAccessoryWeight;
  const fitScore = recommendedAccessories.length > 0
    ? Math.round(totalScoreSum / recommendedAccessories.length)
    : 70;

  return {
    success: true,
    modelId: model.id,
    basePriceKRW,
    totalPriceKRW,
    totalWeightGrams,
    fitScore: Math.min(100, Math.max(50, fitScore)),
    accessories: recommendedAccessories,
    isManualSelection: false
  };
}

