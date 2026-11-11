import { describe, it, expect } from 'vitest';
import { calculateRecommendation, scoreAccessory } from '../../server/recommender.js';

describe('AIRMOD 추천 엔진 단위 테스트', () => {
  const sampleModel = {
    id: 'm4-001',
    name: 'M4A1 카빈',
    priceKRW: 350000,
    weightGrams: 2500
  };

  const sampleAccessories = [
    {
      id: 'acc-1',
      name: '레드 도트',
      category: 'optic',
      slot: 'optic',
      priceKRW: 65000,
      weightGrams: 130,
      environmentTags: ['indoor'],
      styleTags: ['balanced'],
      priorityTags: ['appearance']
    },
    {
      id: 'acc-2',
      name: '포어그립',
      category: 'grip',
      slot: 'foregrip',
      priceKRW: 25000,
      weightGrams: 80,
      environmentTags: ['indoor'],
      styleTags: ['balanced'],
      priorityTags: ['appearance']
    }
  ];

  it('기본 모델 가격이 예산보다 크면 에러를 반환해야 한다', () => {
    const result = calculateRecommendation({
      model: sampleModel,
      compatibleAccessories: sampleAccessories,
      environment: 'indoor',
      style: 'balanced',
      priority: 'appearance',
      budgetKRW: 300000 // 모델(35만)보다 적음
    });

    expect(result.success).toBe(false);
    expect(result.errorReason).toBe('budget_exceeded_base_model');
  });

  it('예산 내에서 호환 부품이 정상 추천되고 계산되어야 한다', () => {
    const result = calculateRecommendation({
      model: sampleModel,
      compatibleAccessories: sampleAccessories,
      environment: 'indoor',
      style: 'balanced',
      priority: 'appearance',
      budgetKRW: 500000
    });

    expect(result.success).toBe(true);
    expect(result.accessories.length).toBe(2);
    expect(result.totalPriceKRW).toBe(350000 + 65000 + 25000);
    expect(result.totalWeightGrams).toBe(2500 + 130 + 80);
    expect(result.fitScore).toBeGreaterThanOrEqual(50);
  });
});

