/**
 * server/validation.js
 * 
 * 클라이언트(사용자 브라우저)에서 전송된 API 요청 데이터를 안전하게 검증하는 모듈입니다.
 * 보안 원칙: 신뢰할 수 없는 외부 입력을 철저히 검사하여 주입 공격이나 서버 오류를 방지합니다.
 */

// 허용된 유효 값 정의
export const VALID_ENVIRONMENTS = ['indoor', 'outdoor', 'shooting', 'cosplay'];
export const VALID_STYLES = ['lightweight', 'balanced', 'appearance', 'budget'];
export const VALID_PRIORITIES = ['appearance', 'weight', 'price', 'usability'];

export const MIN_BUDGET = 100000;  // 최소 예산: 10만 원
export const MAX_BUDGET = 2000000; // 최대 예산: 200만 원
export const BUDGET_STEP = 50000;  // 5만 원 단위

/**
 * 추천 요청(POST /api/recommend) 데이터 유효성 검사 함수
 * @param {object} body - 요청 본문 객체
 * @returns {{ isValid: boolean, error?: string, sanitizedData?: object }}
 */
export function validateRecommendRequest(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: '유효한 JSON 요청 데이터가 필요합니다.' };
  }

  const { modelId, environment, style, priority, budgetKRW, selectedAccessoryIds } = body;

  // 1. 모델 ID 검사
  if (!modelId || typeof modelId !== 'string' || modelId.trim().length === 0) {
    return { isValid: false, error: '기본 모델을 반드시 선택해야 합니다.' };
  }

  // 2. 환경(environment) 검사
  if (!environment || !VALID_ENVIRONMENTS.includes(environment)) {
    return { isValid: false, error: '유효한 사용 환경(실내, 야외, 타깃 슈팅, 전시/코스프레)을 선택해 주세요.' };
  }

  // 3. 모딩 성향(style) 검사
  if (!style || !VALID_STYLES.includes(style)) {
    return { isValid: false, error: '유효한 모딩 성향(경량, 균형, 외관, 가성비)을 선택해 주세요.' };
  }

  // 4. 우선순위(priority) 검사
  if (!priority || !VALID_PRIORITIES.includes(priority)) {
    return { isValid: false, error: '유효한 우선순위(외관, 무게, 가격, 편의성)를 선택해 주세요.' };
  }

  // 5. 예산(budgetKRW) 검사: 10만~200만 원, 5만 원 단위 정수
  const budgetNum = Number(budgetKRW);
  if (
    Number.isNaN(budgetNum) ||
    !Number.isInteger(budgetNum) ||
    budgetNum < MIN_BUDGET ||
    budgetNum > MAX_BUDGET
  ) {
    return { isValid: false, error: `예산은 ${MIN_BUDGET.toLocaleString('ko-KR')}원 이상, ${MAX_BUDGET.toLocaleString('ko-KR')}원 이하 범위 내여야 합니다.` };
  }

  // 6. 선택된 액세서리 ID 목록 검사 (선택 사항)
  let cleanAccessoryIds = [];
  if (selectedAccessoryIds !== undefined && selectedAccessoryIds !== null) {
    if (!Array.isArray(selectedAccessoryIds)) {
      return { isValid: false, error: '선택된 액세서리 목록은 배열 형식이어야 합니다.' };
    }
    cleanAccessoryIds = selectedAccessoryIds.filter(id => typeof id === 'string' && id.trim().length > 0);
  }

  return {
    isValid: true,
    sanitizedData: {
      modelId: modelId.trim(),
      environment,
      style,
      priority,
      budgetKRW: budgetNum,
      selectedAccessoryIds: cleanAccessoryIds
    }
  };
}

/**
 * 이미지 검색 요청(POST /api/images) 데이터 검증 함수
 */
export function validateImagesRequest(body) {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: '유효한 JSON 요청 데이터가 필요합니다.' };
  }

  const { modelId, accessoryIds } = body;
  if (!modelId || typeof modelId !== 'string') {
    return { isValid: false, error: 'modelId 값이 올바르지 않습니다.' };
  }

  let cleanAccessoryIds = [];
  if (accessoryIds) {
    if (!Array.isArray(accessoryIds)) {
      return { isValid: false, error: 'accessoryIds는 배열이어야 합니다.' };
    }
    cleanAccessoryIds = accessoryIds.filter(id => typeof id === 'string');
  }

  return {
    isValid: true,
    sanitizedData: {
      modelId: modelId.trim(),
      accessoryIds: cleanAccessoryIds
    }
  };
}

