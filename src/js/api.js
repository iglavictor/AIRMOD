/**
 * src/js/api.js
 * 
 * 백엔드 서버 API(/api/*)와의 HTTP 통신 모듈입니다.
 */

export async function fetchModels() {
  const res = await fetch('/api/models');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '총기 모델 목록을 불러오지 못했습니다.');
  }
  const data = await res.json();
  return data.models || [];
}

export async function fetchAccessories(modelId) {
  const res = await fetch(`/api/accessories?modelId=${encodeURIComponent(modelId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '호환 부품 목록을 불러오지 못했습니다.');
  }
  const data = await res.json();
  return data.accessories || [];
}

export async function requestRecommendation(payload) {
  const res = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || '추천 생성에 실패했습니다.');
  }

  return await res.json();
}

export async function requestImages(payload) {
  const res = await fetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    return { status: 'empty', images: [] };
  }

  return await res.json();
}

