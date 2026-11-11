/**
 * src/js/storage.js
 * 
 * 브라우저 LocalStorage를 이용한 모딩 프리셋 저장 및 불러오기 관리
 */

const STORAGE_KEY = 'airmod_presets_v1';

export function getSavedPresets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('프리셋 로드 실패:', e);
    return [];
  }
}

export function savePreset(presetData) {
  try {
    const presets = getSavedPresets();
    const newPreset = {
      id: `preset-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      ...presetData
    };
    presets.unshift(newPreset);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return newPreset;
  } catch (e) {
    console.error('프리셋 저장 실패:', e);
    return null;
  }
}

export function deletePreset(presetId) {
  try {
    const presets = getSavedPresets().filter(p => p.id !== presetId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
    return true;
  } catch (e) {
    console.error('프리셋 삭제 실패:', e);
    return false;
  }
}

