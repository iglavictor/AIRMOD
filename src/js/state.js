/**
 * src/js/state.js
 * 
 * AIRMOD 클라이언트의 단일 상태(State) 저장소입니다.
 */

export const state = {
  // 사용 가능한 전체 모델 목록
  models: [],
  // 현재 선택된 총기 모델 객체
  selectedModel: null,
  // 사용자가 설정한 입력 폼 값
  config: {
    environment: 'indoor',
    style: 'balanced',
    priority: 'appearance',
    budgetKRW: 500000
  },
  // 현재 모델에 호환되는 전체 부품 목록
  compatibleAccessories: [],
  // 서버로부터 받은 추천 결과
  recommendation: null,
  // 현재 장착으로 선택된 부품 ID 목록
  selectedAccessoryIds: [],
  // 검색된 유사 이미지 목록
  galleryImages: [],
  // UI 로딩 상태
  isLoading: false
};

