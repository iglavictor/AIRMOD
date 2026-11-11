// src/js/guestbook.js
// 방명록·피드백 UI 로직
// 보안: 모든 텍스트는 textContent 로 삽입하고, innerHTML 사용 금지

console.log('🔔 guestbook.js 로드 완료');


// 피드백 목록 로드
async function loadFeedback() {
  const listEl = document.getElementById('guestbook-list');
  listEl.textContent = '불러오는 중…';
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Invalid response');
    listEl.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('li');
      li.className = 'guestbook__item';

      const header = document.createElement('div');
      const nameEl = document.createElement('strong');
      nameEl.className = 'guestbook__name';
      nameEl.textContent = item.name;
      const dateEl = document.createElement('span');
      dateEl.className = 'guestbook__date';
      dateEl.textContent = new Date(item.created_at).toLocaleString('ko-KR');

      header.appendChild(nameEl);
      header.appendChild(dateEl);

      const msg = document.createElement('p');
      msg.className = 'guestbook__msg';
      msg.textContent = item.message;

      li.appendChild(header);
      li.appendChild(msg);
      listEl.appendChild(li);
    });
  } catch (e) {
    listEl.innerHTML = '<li class="guestbook__item">피드백을 로드하는 중 오류가 발생했습니다.</li>';
    console.error(e);
  }
}

// 폼 전송 처리
async function handleGuestbookSubmit(event) {
  event.preventDefault();
  const statusEl = document.getElementById('gb-status');
  const name = document.getElementById('gb-name').value.trim();
  const message = document.getElementById('gb-message').value.trim();

  if (!name || !message) {
    statusEl.textContent = '이름과 메시지를 모두 입력해 주세요.';
    statusEl.hidden = false;
    return;
  }

  statusEl.textContent = '전송 중…';
  statusEl.hidden = false;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message })
    });
    if (!res.ok) throw new Error('전송 실패');
    // 성공 시 입력 비우고 목록 새로고침
    document.getElementById('gb-name').value = '';
    document.getElementById('gb-message').value = '';
    statusEl.textContent = '감사합니다! 방명록에 등록되었습니다.';
    loadFeedback();
  } catch (e) {
    statusEl.textContent = '전송 중 오류가 발생했습니다.';
    console.error(e);
  }
}

// 초기화 - DOMContentLoaded 시 실행
document.addEventListener('DOMContentLoaded', () => {
  loadFeedback();
  const form = document.getElementById('guestbook-form');
  form.addEventListener('submit', handleGuestbookSubmit);
});

