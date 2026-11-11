/**
 * src/js/calculator.js
 * 
 * 가격(KRW) 및 무게(g, kg) 표시 서식 변환 유틸리티
 */

/**
 * 금액을 한국어 원화 표기 형식으로 변환 (예: 350,000원)
 */
export function formatCurrencyKRW(amount) {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('ko-KR')}원`;
}

/**
 * 무게를 g 및 kg 단위로 변환 (예: 2,500g (2.50kg))
 */
export function formatWeight(grams) {
  const g = Number(grams) || 0;
  const kg = (g / 1000).toFixed(2);
  return `${g.toLocaleString('ko-KR')}g (${kg}kg)`;
}

