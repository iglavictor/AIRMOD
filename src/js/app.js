/**
 * src/js/app.js
 * 
 * AIRMOD 클라이언트 메인 애플리케이션 엔트리포인트입니다.
 */

import { state } from './state.js';
import { formatCurrencyKRW } from './calculator.js';
import { fetchModels, fetchAccessories, requestRecommendation, requestImages } from './api.js';
import { renderModelCards, renderRecommendationResult, renderGalleryImages } from './render.js';
import './guestbook.js';
import { getSavedPresets, savePreset, deletePreset } from './storage.js';

// DOM 요소 캐싱
const elements = {
  modelList: document.getElementById('model-list'),
  budgetSlider: document.getElementById('budget-slider'),
  budgetDisplay: document.getElementById('budget-display'),
  moddingForm: document.getElementById('modding-form'),
  btnRecommend: document.getElementById('btn-run-recommend'),

  resultEmpty: document.getElementById('result-empty'),
  resultLoading: document.getElementById('result-loading'),
  resultContent: document.getElementById('result-content'),

  totalPriceEl: document.getElementById('summary-total-price'),
  totalWeightEl: document.getElementById('summary-total-weight'),
  fitScoreEl: document.getElementById('summary-fit-score'),
  reasonEl: document.getElementById('explanation-reason'),
  prosListEl: document.getElementById('pros-list'),
  consListEl: document.getElementById('cons-list'),
  accessoriesListEl: document.getElementById('recommended-accessories-list'),
  sourceBadgeEl: document.getElementById('explanation-source-badge'),
  accCountEl: document.getElementById('acc-count'),

  galleryGrid: document.getElementById('image-gallery-grid'),
  galleryDisclaimer: document.getElementById('gallery-disclaimer'),

  btnSavePreset: document.getElementById('btn-save-preset'),
  btnShareConfig: document.getElementById('btn-share-config'),
  btnOpenPresets: document.getElementById('btn-open-presets'),
  savedPresetCount: document.getElementById('saved-preset-count'),
  btnResetAll: document.getElementById('btn-reset-all'),

  // 모달
  pickerModal: document.getElementById('accessory-picker-modal'),
  modalOptions: document.getElementById('modal-accessory-options'),
  btnCloseModal: document.getElementById('btn-close-modal'),

  presetModal: document.getElementById('preset-modal'),
  presetListEl: document.getElementById('preset-list'),
  btnClosePresetModal: document.getElementById('btn-close-preset-modal')
};

// 1. 초기 데이터 로드
async function init() {
  updatePresetCountBadge();

  try {
    const models = await fetchModels();
    state.models = models;

    if (models.length > 0) {
      // 첫 번째 모델 기본 선택
      selectModel(models[0]);
    }
  } catch (err) {
    console.error('초기화 실패:', err);
    elements.modelList.textContent = `데이터 로드 실패: ${err.message}`;
  }

  setupEventListeners();
}

// 2. 모델 선택 처리
async function selectModel(model) {
  state.selectedModel = model;
  state.selectedAccessoryIds = []; // 모델 변경 시 선택 부품 초기화

  // 모델 카드 다시 렌더링
  renderModelCards(elements.modelList, state.models, model.id, selectModel);

  // 해당 모델의 호환 부품 로드
  try {
    state.compatibleAccessories = await fetchAccessories(model.id);
  } catch (e) {
    console.warn('호환 부품 로드 오류:', e);
  }
}

// 3. 이벤트 리스너 등록
function setupEventListeners() {
  // 예산 슬라이더 변경 감지
  elements.budgetSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    state.config.budgetKRW = val;
    elements.budgetDisplay.textContent = formatCurrencyKRW(val);
  });

  // 폼 라디오 변경 감지
  elements.moddingForm.addEventListener('change', (e) => {
    const { name, value } = e.target;
    if (['environment', 'style', 'priority'].includes(name)) {
      state.config[name] = value;
    }
  });

  // 추천 실행 버튼 클릭
  elements.btnRecommend.addEventListener('click', () => {
    state.selectedAccessoryIds = []; // 자동 추천 시 기존 수동 선택 리셋
    executeRecommendation();
  });

  // 전체 초기화 버튼
  elements.btnResetAll.addEventListener('click', () => {
    if (confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      window.location.reload();
    }
  });

  // 모달 닫기
  elements.btnCloseModal.addEventListener('click', () => elements.pickerModal.close());
  elements.btnClosePresetModal.addEventListener('click', () => elements.presetModal.close());

  // 프리셋 저장
  elements.btnSavePreset.addEventListener('click', handleSaveCurrentPreset);
  elements.btnOpenPresets.addEventListener('click', handleOpenPresetsModal);

  // 공유 버튼
  elements.btnShareConfig.addEventListener('click', () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('현재 설정 링크가 클립보드에 복사되었습니다.');
  });
}

// 4. 추천 API 호출 및 결과 반영
async function executeRecommendation() {
  if (!state.selectedModel) {
    alert('총기 모델을 선택해 주세요.');
    return;
  }

  elements.resultEmpty.classList.add('is-hidden');
  elements.resultContent.classList.add('is-hidden');
  elements.resultLoading.classList.remove('is-hidden');

  try {
    const payload = {
      modelId: state.selectedModel.id,
      environment: state.config.environment,
      style: state.config.style,
      priority: state.config.priority,
      budgetKRW: state.config.budgetKRW,
      selectedAccessoryIds: state.selectedAccessoryIds
    };

    const result = await requestRecommendation(payload);
    state.recommendation = result;
    state.selectedAccessoryIds = result.accessories.map(a => a.id);

    // 결과 렌더링
    renderRecommendationResult(elements, result, openAccessoryPicker);

    elements.resultLoading.classList.add('is-hidden');
    elements.resultContent.classList.remove('is-hidden');

    // 이미지 검색 요청 (비동기 병렬 실행)
    loadSimilarImages(state.selectedModel.id, state.selectedAccessoryIds);
  } catch (error) {
    elements.resultLoading.classList.add('is-hidden');
    elements.resultEmpty.classList.remove('is-hidden');
    alert(`추천 오류: ${error.message}`);
  }
}

// 5. 유사 이미지 로드
async function loadSimilarImages(modelId, accessoryIds) {
  try {
    const data = await requestImages({ modelId, accessoryIds });
    renderGalleryImages(elements.galleryGrid, elements.galleryDisclaimer, data);
  } catch (e) {
    console.error('이미지 로드 실패:', e);
  }
}

// 6. 부품 교체 모달 열기 (FR-11: 부품 교체 지원)
function openAccessoryPicker(currentAcc) {
  const slot = currentAcc.slot || currentAcc.category;
  const sameSlotOptions = state.compatibleAccessories.filter(a => (a.slot || a.category) === slot);

  elements.modalOptions.replaceChildren();

  // '장착 해제(순정)' 옵션
  const detachRow = document.createElement('div');
  detachRow.className = 'accessory-row';
  detachRow.innerHTML = `<div class="acc-info"><span class="acc-name text-muted">장착 해제 (탈거)</span></div>`;
  detachRow.addEventListener('click', () => {
    state.selectedAccessoryIds = state.selectedAccessoryIds.filter(id => id !== currentAcc.id);
    elements.pickerModal.close();
    executeRecommendation();
  });
  elements.modalOptions.appendChild(detachRow);

  // 동일 슬롯 호환 부품 목록
  for (const acc of sameSlotOptions) {
    const row = document.createElement('div');
    row.className = `accessory-row ${acc.id === currentAcc.id ? 'is-selected' : ''}`;
    row.innerHTML = `
      <div class="acc-info">
        <span class="acc-name">${acc.name}</span>
        <span class="acc-meta">${acc.manufacturer} · ${formatCurrencyKRW(acc.priceKRW)}</span>
      </div>
      <div class="acc-right">
        <span class="acc-price">${acc.id === currentAcc.id ? '현재 장착됨' : '선택 ➔'}</span>
      </div>
    `;

    row.addEventListener('click', () => {
      // 기존 부품 빼고 새 부품 넣기
      state.selectedAccessoryIds = state.selectedAccessoryIds.filter(id => id !== currentAcc.id);
      state.selectedAccessoryIds.push(acc.id);
      elements.pickerModal.close();
      executeRecommendation();
    });

    elements.modalOptions.appendChild(row);
  }

  elements.pickerModal.showModal();
}

// 7. 프리셋 저장 및 불러오기
function updatePresetCountBadge() {
  const count = getSavedPresets().length;
  elements.savedPresetCount.textContent = String(count);
}

function handleSaveCurrentPreset() {
  if (!state.recommendation || !state.selectedModel) {
    alert('먼저 추천을 실행해 주세요.');
    return;
  }

  const preset = {
    title: `${state.selectedModel.name} - ${state.config.style} 세팅`,
    modelId: state.selectedModel.id,
    config: { ...state.config },
    selectedAccessoryIds: [...state.selectedAccessoryIds],
    totalPriceKRW: state.recommendation.totalPriceKRW,
    totalWeightGrams: state.recommendation.totalWeightGrams
  };

  savePreset(preset);
  updatePresetCountBadge();
  alert('현재 모딩 구성이 브라우저에 안전하게 저장되었습니다!');
}

function handleOpenPresetsModal() {
  const presets = getSavedPresets();
  elements.presetListEl.replaceChildren();

  if (presets.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'text-muted';
    empty.textContent = '저장된 프리셋이 없습니다.';
    elements.presetListEl.appendChild(empty);
  } else {
    for (const p of presets) {
      const item = document.createElement('div');
      item.className = 'accessory-row';
      item.innerHTML = `
        <div class="acc-info">
          <span class="acc-name">${p.title}</span>
          <span class="acc-meta">${formatCurrencyKRW(p.totalPriceKRW)}</span>
        </div>
        <div class="acc-right">
          <button class="btn btn-primary btn-sm" type="button">불러오기</button>
          <button class="btn btn-ghost btn-sm text-danger" type="button">삭제</button>
        </div>
      `;

      // 불러오기
      item.querySelector('.btn-primary').addEventListener('click', () => {
        applyPreset(p);
        elements.presetModal.close();
      });

      // 삭제
      item.querySelector('.text-danger').addEventListener('click', () => {
        deletePreset(p.id);
        updatePresetCountBadge();
        handleOpenPresetsModal();
      });

      elements.presetListEl.appendChild(item);
    }
  }

  elements.presetModal.showModal();
}

function applyPreset(preset) {
  const model = state.models.find(m => m.id === preset.modelId);
  if (model) {
    selectModel(model);
  }

  state.config = { ...preset.config };
  elements.budgetSlider.value = preset.config.budgetKRW;
  elements.budgetDisplay.textContent = formatCurrencyKRW(preset.config.budgetKRW);

  // 라디오 복원
  for (const key of ['environment', 'style', 'priority']) {
    const radio = elements.moddingForm.querySelector(`input[name="${key}"][value="${preset.config[key]}"]`);
    if (radio) radio.checked = true;
  }

  state.selectedAccessoryIds = [...preset.selectedAccessoryIds];
  executeRecommendation();
}

// 초기화 시작
init();

