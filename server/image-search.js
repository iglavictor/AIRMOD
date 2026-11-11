/**
 * server/image-search.js
 * 
 * 추천 구성과 가장 유사한 인터넷 에어소프트건 이미지를 안전하게 검색하는 어댑터 모듈입니다.
 * 
 * 주요 원칙 (PRD 제5조 이미지 검색 규칙 준수):
 * 1. Google Programmable Search JSON API (Custom Search API) 연동.
 * 2. API 키가 없거나 할당량 초과 시, 서비스가 멈추지 않고 '안전한 가상 참고 이미지'를 제공.
 * 3. 8초 타임아웃, HTTPS URL만 허용, 최대 상위 3건 제공, 고지 문구 필수 포함.
 */

import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.IMAGE_SEARCH_API_KEY || '';
const ENGINE_ID = process.env.IMAGE_SEARCH_ENGINE_ID || '';

const isSearchConfigured = API_KEY && 
  ENGINE_ID && 
  !API_KEY.includes('your_google_custom_search_api_key_here');

// 기본 안전 샘플 이미지 목록 (Fallback)
const SAMPLE_AIRSOFT_IMAGES = [
  {
    title: '[참고 예시] M4A1 택티컬 외장 커스텀 구성',
    imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=800&q=80',
    sourceUrl: 'https://unsplash.com',
    sourceDomain: 'unsplash.com',
    similarityScore: 90
  },
  {
    title: '[참고 예시] 에어소프트 외장 액세서리 장착 참고',
    imageUrl: 'https://images.unsplash.com/photo-1584281722573-982eb98b0fd2?auto=format&fit=crop&w=800&q=80',
    sourceUrl: 'https://unsplash.com',
    sourceDomain: 'unsplash.com',
    similarityScore: 85
  },
  {
    title: '[참고 예시] 핸드건 마이크로 도트 커스텀 스타일',
    imageUrl: 'https://images.unsplash.com/photo-1585589074491-3c1bbac1dc42?auto=format&fit=crop&w=800&q=80',
    sourceUrl: 'https://unsplash.com',
    sourceDomain: 'unsplash.com',
    similarityScore: 80
  }
];

/**
 * 유사 에어소프트 이미지 검색 실행 함수
 */
export async function searchSimilarAirsoftImages({ modelName, accessories = [] }) {
  const disclaimer = '유사한 참고 이미지이며 실제 추천 구성과 다를 수 있습니다.';

  // 검색 API가 설정되지 않았을 경우 안전한 샘플 데이터 반환
  if (!isSearchConfigured) {
    return {
      status: 'ok',
      disclaimer,
      isMock: true,
      images: SAMPLE_AIRSOFT_IMAGES
    };
  }

  // 검색 쿼리 구성: 모델명 + airsoft + 외장 액세서리명
  const accQuery = accessories.slice(0, 2).map(a => a.name.replace(/\[.*?\]/g, '').trim()).join(' ');
  const query = `${modelName.replace(/\[.*?\]/g, '').trim()} airsoft ${accQuery}`.trim();

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('cx', ENGINE_ID);
    url.searchParams.set('q', query);
    url.searchParams.set('searchType', 'image');
    url.searchParams.set('num', '5'); // 최대 5건 조회 후 필터링
    url.searchParams.set('safe', 'active');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[ImageSearch] 구글 API 응답 에러 (${response.status}), 기본 샘플로 대체합니다.`);
      return { status: 'ok', disclaimer, isMock: true, images: SAMPLE_AIRSOFT_IMAGES };
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return { status: 'empty', disclaimer, images: [] };
    }

    // 결과 필터링 및 유사도 점수 계산
    const seenUrls = new Set();
    const cleanResults = [];

    for (const item of data.items) {
      const link = item.link;
      const contextLink = item.image?.contextLink || link;
      const title = item.title || '에어소프트 참고 이미지';

      // HTTPS 검사 및 중복 검사
      if (!link || !link.startsWith('https://') || seenUrls.has(link)) continue;
      seenUrls.add(link);

      let sourceDomain = 'google.com';
      try {
        sourceDomain = new URL(contextLink).hostname;
      } catch {
        // 무시
      }

      // 간단한 키워드 기반 유사도 채점 (모델명 매칭 50점, 에어소프트 30점, 기본 10점)
      let similarityScore = 70;
      if (title.toLowerCase().includes('airsoft')) similarityScore += 15;
      if (title.toLowerCase().includes(modelName.toLowerCase())) similarityScore += 15;

      cleanResults.push({
        title,
        imageUrl: link,
        sourceUrl: contextLink,
        sourceDomain,
        similarityScore: Math.min(99, similarityScore)
      });

      if (cleanResults.length >= 3) break; // 최대 3건
    }

    return {
      status: cleanResults.length > 0 ? 'ok' : 'empty',
      disclaimer,
      isMock: false,
      images: cleanResults
    };
  } catch (error) {
    console.warn('[ImageSearch] 이미지 검색 중 오류 발생, 샘플로 대체:', error.message);
    return {
      status: 'ok',
      disclaimer,
      isMock: true,
      images: SAMPLE_AIRSOFT_IMAGES
    };
  }
}

