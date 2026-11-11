/**
 * src/js/render.js
 * 
 * 브라우저 화면(DOM)을 안전하게 렌더링하는 모듈입니다.
 * 
 * 보안 수칙 (PRD 제3조 작업 규칙):
 * - 사용자 입력이나 외부 API 텍스트 삽입 시 innerHTML 금지, 반드시 textContent 사용.
 */

import { formatCurrencyKRW, formatWeight } from './calculator.js';

/**
 * 기본 총기 모델 카드 목록 렌더링
 */
export function renderModelCards(container, models, selectedModelId, onSelect) {
  container.replaceChildren();

  if (!models || models.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-muted';
    empty.textContent = '등록된 총기 모델이 없습니다.';
    container.appendChild(empty);
    return;
  }

  for (const model of models) {
    const card = document.createElement('div');
    card.className = `model-card ${model.id === selectedModelId ? 'is-selected' : ''}`;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-checked', model.id === selectedModelId ? 'true' : 'false');
    card.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'model-card-img';
    img.src = model.imageUrl || 'https://via.placeholder.com/150';
    img.alt = model.name;
    img.loading = 'lazy';

    const title = document.createElement('div');
    title.className = 'model-card-title';
    title.textContent = model.name;

    const meta = document.createElement('div');
    meta.className = 'model-card-meta';
    meta.textContent = `${model.platform} · ${formatWeight(model.weightGrams)}`;

    const price = document.createElement('div');
    price.className = 'model-card-price';
    price.textContent = formatCurrencyKRW(model.priceKRW);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(price);

    const handleSelect = () => onSelect(model);
    card.addEventListener('click', handleSelect);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleSelect();
      }
    });

    container.appendChild(card);
  }
}

/**
 * 추천 결과 요약 및 상세 내역 렌더링
 */
export function renderRecommendationResult(elements, result, onOpenPicker) {
  const {
    totalPriceEl,
    totalWeightEl,
    fitScoreEl,
    reasonEl,
    prosListEl,
    consListEl,
    accessoriesListEl,
    sourceBadgeEl,
    accCountEl
  } = elements;

  totalPriceEl.textContent = formatCurrencyKRW(result.totalPriceKRW);
  totalWeightEl.textContent = formatWeight(result.totalWeightGrams);
  fitScoreEl.textContent = `${result.fitScore}점`;
  reasonEl.textContent = result.reason;

  sourceBadgeEl.textContent = result.explanationSource === 'ai' ? 'AI 컨설팅' : '규칙 분석';
  accCountEl.textContent = String(result.accessories.length);

  // 장점 목록 렌더링
  prosListEl.replaceChildren();
  for (const pro of (result.pros || [])) {
    const li = document.createElement('li');
    li.textContent = pro;
    prosListEl.appendChild(li);
  }

  // 단점 목록 렌더링
  consListEl.replaceChildren();
  for (const con of (result.cons || [])) {
    const li = document.createElement('li');
    li.textContent = con;
    consListEl.appendChild(li);
  }

  // 부품 목록 렌더링
  accessoriesListEl.replaceChildren();
  if (!result.accessories || result.accessories.length === 0) {
    const emptyRow = document.createElement('div');
    emptyRow.className = 'text-muted';
    emptyRow.textContent = '장착된 외장 부품이 없습니다 (순정 상태).';
    accessoriesListEl.appendChild(emptyRow);
    return;
  }

  for (const acc of result.accessories) {
    const row = document.createElement('div');
    row.className = 'accessory-row';
    row.tabIndex = 0;
    row.setAttribute('role', 'button');
    row.setAttribute('aria-label', `${acc.name} 부품 교체`);

    const info = document.createElement('div');
    info.className = 'acc-info';

    const slotBadge = document.createElement('span');
    slotBadge.className = 'acc-slot-badge';
    slotBadge.textContent = acc.slot || acc.category;

    const name = document.createElement('span');
    name.className = 'acc-name';
    name.textContent = acc.name;

    const meta = document.createElement('span');
    meta.className = 'acc-meta';
    meta.textContent = `${acc.manufacturer} · ${formatWeight(acc.weightGrams)}`;

    info.appendChild(slotBadge);
    info.appendChild(name);
    info.appendChild(meta);

    const right = document.createElement('div');
    right.className = 'acc-right';

    const price = document.createElement('div');
    price.className = 'acc-price';
    price.textContent = formatCurrencyKRW(acc.priceKRW);

    const weight = document.createElement('div');
    weight.className = 'acc-weight';
    weight.textContent = '교체 가능 ➔';

    right.appendChild(price);
    right.appendChild(weight);

    row.appendChild(info);
    row.appendChild(right);

    const handleClick = () => onOpenPicker(acc);
    row.addEventListener('click', handleClick);
    row.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    });

    accessoriesListEl.appendChild(row);
  }
}

/**
 * 갤러리 이미지 렌더링
 */
export function renderGalleryImages(container, disclaimerEl, data) {
  container.replaceChildren();
  if (data?.disclaimer) {
    disclaimerEl.textContent = data.disclaimer;
  }

  const images = data?.images || [];
  if (images.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'text-muted';
    empty.textContent = '검색된 유사 참고 이미지가 없습니다.';
    container.appendChild(empty);
    return;
  }

  for (const item of images) {
    const card = document.createElement('a');
    card.className = 'gallery-item';
    card.href = item.sourceUrl || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const img = document.createElement('img');
    img.className = 'gallery-img';
    img.src = item.imageUrl;
    img.alt = item.title;
    img.loading = 'lazy';

    const meta = document.createElement('div');
    meta.className = 'gallery-meta';

    const title = document.createElement('div');
    title.className = 'gallery-title';
    title.textContent = item.title;

    const domain = document.createElement('div');
    domain.className = 'gallery-domain';
    domain.textContent = `${item.sourceDomain} · 유사도 ${item.similarityScore}%`;

    meta.appendChild(title);
    meta.appendChild(domain);

    card.appendChild(img);
    card.appendChild(meta);

    container.appendChild(card);
  }
}

