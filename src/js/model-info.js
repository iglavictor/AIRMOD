/**
 * src/js/model-info.js
 * 
 * 에어소프트건 기본 모델별 실물 제원(구경, 전장, 탄창 등) 및 흥미로운 역사/스토리 정보
 */

export const MODEL_SPECS = {
  // 1. M4A1 카빈
  m4: {
    realCaliber: '5.56 × 45mm NATO',
    realLength: '770mm ~ 850mm (신축식 스톡)',
    realWeight: '약 2,900g (실물 비장전)',
    effectiveRange: '약 500m (실물 유효사거리)',
    features: '피카티니 20mm 레일 시스템을 통한 극대화된 모듈러 확장성',
    historyTitle: '현대 택티컬 카빈의 세계적 표준',
    historyStory: '유진 스토너가 개발한 AR-15 플랫폼을 모태로, 1994년 미 육군에 공식 채용된 컴팩트 카빈 소총입니다. 20mm 피카티니 레일 시스템을 대중화하여 다양한 광학장비, 손잡이, 조명 장비를 자유자재로 모딩할 수 있어 전 세계 특수부대와 에어소프트 동호인에게 가장 사랑받는 모딩 플랫폼입니다.'
  },

  // 2. AKM
  akm: {
    realCaliber: '7.62 × 39mm M43',
    realLength: '880mm',
    realWeight: '약 3,140g (실물 비장전)',
    effectiveRange: '약 350m ~ 400m',
    features: '철판 프레스 가공 바디, 사선형 컴펜세이터(소염기), 우드 스톡',
    historyTitle: '신뢰성과 단순함의 상징, 불후의 명작',
    historyStory: '1959년 미하일 칼라시니코프가 기존 AK-47의 무거운 절삭 가공 리시버를 혁신적인 철판 프레스 방식으로 개량하여 무게를 대폭 줄이고 생산성을 극대화한 제식 소총입니다. 사격 시 총구 상승을 억제하는 사선 소염기와 클래식한 라미네이트 우드가 특징이며, 어떤 혹독한 환경에서도 작동하는 전설적인 내구성을 자랑합니다.'
  },

  // 3. 글록 17
  g17: {
    realCaliber: '9 × 19mm Parabellum',
    realLength: '186mm',
    realWeight: '약 625g (실물 경량 폴리머)',
    effectiveRange: '약 50m (권총 표준)',
    features: '스트라이커 격발식, 세이프 액션(Safe Action) 방아쇠 안전장치, 언더레일',
    historyTitle: '권총 역사의 패러다임을 바꾼 플라스틱 권총',
    historyStory: '오스트리아의 가스통 글록이 1982년 개발한 권총으로, 당시로서는 파격적인 경량 강화 플라스틱(폴리머) 프레임을 도입하여 권총 시장에 거대한 혁명을 일으켰습니다. 외부 해머를 없앤 단순한 구조와 높은 신뢰성 덕분에 전 세계 군경과 특수부대의 기본 제식 권총으로 자리 잡았습니다.'
  },

  // 4. H&K MP5
  mp5: {
    realCaliber: '9 × 19mm Parabellum',
    realLength: '550mm ~ 700mm (인입식 개머리판)',
    realWeight: '약 2,540g (실물)',
    effectiveRange: '약 100m',
    features: '클로즈드 볼트 & 롤러 지연식 블로우백, 높은 단발 명중률',
    historyTitle: '대테러 특수부대의 상징, 정밀 기관단총',
    historyStory: '독일 헤클러 운트 코흐(H&K)사가 G3 소총의 정밀한 롤러 지연식 구조를 그대로 적용하여 1966년 개발한 명품 기관단총입니다. 1980년 영국 SAS의 님로드 작전(주영 이란 대사관 인질극 구출 작전)에서 압도적인 정밀도로 테러범들을 제압하며 전 세계 대테러 부대의 필수 장비로 명성을 떨쳤습니다.'
  }
};

/**
 * 모델 객체나 slug/name 문자열로부터 해당 제원 정보를 검색합니다.
 */
export function getModelSpec(model) {
  if (!model) return null;
  const key = `${model.slug || ''} ${model.name || ''} ${model.platform || ''}`.toLowerCase();

  if (key.includes('m4') || key.includes('ar-15')) return MODEL_SPECS.m4;
  if (key.includes('akm') || key.includes('ak')) return MODEL_SPECS.akm;
  if (key.includes('g17') || key.includes('글록') || key.includes('handgun') || key.includes('핸드건')) return MODEL_SPECS.g17;
  if (key.includes('mp5')) return MODEL_SPECS.mp5;

  return MODEL_SPECS.m4;
}

