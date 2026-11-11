/**
 * server/ai.js
 * 
 * 추천 결과에 대한 한국어 설명(reason)과 장단점(pros, cons)을 생성하는 모듈입니다.
 * 
 * 안전 및 비용 원칙:
 * 1. OpenAI API 키가 없거나 할당량 초과, 네트워크 오류 발생 시 
 *    시스템이 멈추지 않고 미리 준비된 '정교한 한국어 규칙 템플릿(Fallback)'으로 자동 대체됩니다.
 * 2. 수치(가격, 무게)는 AI가 마음대로 지어내지 못하도록 서버가 계산한 정확한 값을 그대로 전달합니다.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

// API 키 유효성 확인
const isApiKeyValid = OPENAI_API_KEY && 
  OPENAI_API_KEY.startsWith('sk-') && 
  !OPENAI_API_KEY.includes('your_openai_api_key_here');

const openai = isApiKeyValid ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

/**
 * 규칙 기반 한국어 설명 생성기 (Fallback / 안전망)
 */
function generateRuleBasedExplanation({ modelName, environment, style, priority, accessories, totalPriceKRW }) {
  const envMap = {
    indoor: '실내 CQB 게임',
    outdoor: '야외 필드 게임',
    shooting: '정밀 타깃 슈팅',
    cosplay: '전시 및 코스프레'
  };

  const styleMap = {
    lightweight: '민첩한 기동성을 중시하는 경량화',
    balanced: '모든 상황에 유연하게 대응하는 밸런스형',
    appearance: '택티컬한 감성과 시각적 완성도를 높이는 외관 중심',
    budget: '실속 있는 파츠 구성의 가성비'
  };

  const priorityMap = {
    appearance: '외관 디자인 완성도',
    weight: '가벼운 총기 무게',
    price: '합리적인 가격',
    usability: '운용 편의성'
  };

  const envText = envMap[environment] || '에어소프트 활동';
  const styleText = styleMap[style] || '균형 잡힌';
  const priorityText = priorityMap[priority] || '조작 편의성';

  const accessoryNames = accessories.map(a => a.name.replace('[샘플] ', '')).join(', ');

  const reason = `${modelName} 모델을 기반으로 ${envText} 환경과 ${styleText} 성향, 그리고 최우선 조건인 ${priorityText}을(를) 고려하여 구성된 추천 세팅입니다. 총기 기본 성능을 해치지 않는 규격 검증(verified) 외장 파츠들(${accessoryNames || '순정 외관'})로 총 ${totalPriceKRW.toLocaleString('ko-KR')}원 예산에 맞추었습니다.`;

  const pros = [
    `설정하신 ${envText} 목적에 특화된 외장 액세서리 배치`,
    `검증된 규격 파츠만을 사용하여 간섭 없이 장착 가능`,
    `${styleText} 컨셉에 부합하는 일관된 외관 밸런스`
  ];

  const cons = [
    accessories.length === 0 ? '예산 한도로 인해 추가 액세서리가 장착되지 않았습니다.' : '추가 외장 장착으로 인해 순정 상태 대비 무게가 소폭 증가했습니다.',
    '본 추천은 외관 및 편의성 기준이며 내부 발사 성능 개조는 포함하지 않습니다.'
  ];

  return {
    reason,
    pros,
    cons,
    explanationSource: 'rule'
  };
}

/**
 * 추천 결과 설명 생성 메인 함수
 */
export async function generateRecommendationExplanation(payload) {
  const { modelName, environment, style, priority, accessories, totalPriceKRW, totalWeightGrams } = payload;

  // OpenAI 설정이 없으면 즉시 규칙 기반 생성기 실행
  if (!openai) {
    return generateRuleBasedExplanation(payload);
  }

  try {
    const prompt = `
당신은 에어소프트건 외장 모딩 전문 컨설턴트입니다.
다음 추천 구성에 대해 자연스러운 한국어로 추천 이유(reason)와 장점(pros: 2~4개), 단점(cons: 1~3개)을 JSON 형식으로 작성해 주세요.

[모딩 구성 정보]
- 기본 모델: ${modelName}
- 사용 환경: ${environment}
- 선호 성향: ${style}
- 우선순위: ${priority}
- 총 예상 비용: ${totalPriceKRW.toLocaleString('ko-KR')} KRW
- 총 중량: ${totalWeightGrams}g
- 장착 액세서리: ${accessories.map(a => a.name).join(', ') || '없음'}

[작성 규칙]
1. 반드시 순수 JSON 객체만 응답하세요. { "reason": "...", "pros": ["..."], "cons": ["..."] }
2. 발사 위력, 사거리, 탄속 개조 등 내부 성능 개조나 실총 관련 언급은 절대 금지합니다 (오직 외관 장식 및 파츠 그립감, 휴대성만 설명).
3. 사실에 기반하며 과장된 성능 주장을 하지 마세요.
`;

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      reason: parsed.reason || '선택하신 환경과 조건에 최적화된 추천 세팅입니다.',
      pros: Array.isArray(parsed.pros) ? parsed.pros : ['검증된 외장 파츠 구성'],
      cons: Array.isArray(parsed.cons) ? parsed.cons : ['외장 파츠 장착으로 무게 증가'],
      explanationSource: 'ai'
    };
  } catch (error) {
    console.warn('[AI] OpenAI 호출 실패, 규칙 기반 템플릿으로 대체합니다:', error.message);
    return generateRuleBasedExplanation(payload);
  }
}

