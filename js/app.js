import { loadCategories, loadChecklists } from './api.js';
import { isPaid, needsPayment, showPaymentModal, getPrice } from './payments.js';

const app = document.getElementById('app');
const WORKER_URL = 'https://checklistings-en.dan-svistunov.workers.dev';

let state = {
  screen: 'categories',
  categories: [],
  category: null,
  checklists: [],
  current: null
};

// STORAGE
const getProgress = () => {
  try { return JSON.parse(localStorage.getItem('progress') || '{}'); }
  catch { return {}; }
};

const getOpened = () => {
  try { return JSON.parse(localStorage.getItem('opened') || '{}'); }
  catch { return {}; }
};

const setDone = (id) => {
  const p = getProgress();
  p[id] = true;
  localStorage.setItem('progress', JSON.stringify(p));
};

const setOpened = (id) => {
  const o = getOpened();
  o[id] = true;
  localStorage.setItem('opened', JSON.stringify(o));
};

function getLevel(percent) {
  if (percent < 20) return 'Beginner';
  if (percent < 50) return 'Amateur';
  if (percent < 80) return 'Advanced';
  return 'Master';
}

async function trackUser() {
  try {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;
      
      if (user?.id) {
        fetch(`${WORKER_URL}/api/track-user`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            username: user.username || '',
            first_name: user.first_name || ''
          })
        }).catch(() => {});

        fetch(`${WORKER_URL}/api/track-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            event: 'app_open',
            data: { platform: tg.platform, version: tg.version }
          })
        }).catch(() => {});
      }
    }
  } catch (e) {}
}

async function trackChecklistComplete(checklistId, checklistTitle) {
  try {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;
      
      if (user?.id) {
        fetch(`${WORKER_URL}/api/track-progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            checklist_id: checklistId,
            checklist_title: checklistTitle
          })
        }).catch(() => {});
      }
    }
  } catch (e) {}
}

// INIT
async function init() {
  try {
    await trackUser();
    state.categories = await loadCategories();
    render();
  } catch (e) {
    console.error('Init error:', e);
    app.innerHTML = '<p style="text-align:center;padding:40px;">Loading error</p>';
  }
}

function render() {
  if (state.screen === 'categories') renderCategories();
  else if (state.screen === 'list') renderList();
  else if (state.screen === 'check') renderCheck();
}

async function renderCategories() {
  const progress = getProgress();
  const categoriesWithProgress = await Promise.all(
    state.categories.map(async (c) => {
      const lists = await loadChecklists(c.id);
      const total = lists.length;
      const done = lists.filter(l => progress[l.id]).length;
      const percent = total ? Math.round(done / total * 100) : 0;
      return { ...c, percent };
    })
  );

  const percent = Math.round(
    categoriesWithProgress.reduce((acc, c) => acc + c.percent, 0) / categoriesWithProgress.length
  );
  const level = getLevel(percent);
  categoriesWithProgress.sort((a, b) => b.percent - a.percent);

  app.innerHTML = `
    <h1>Checklists!</h1>
    <div class="dashboard">
      <div class="dashboard-title">Your Progress</div>
      <div class="dashboard-level">${level}</div>
      <div class="dashboard-bar"><div class="dashboard-fill" style="width:${percent}%"></div></div>
      <div style="margin-top:6px;">${percent}% completed</div>
    </div>
    ${categoriesWithProgress.map(c => `
      <div class="card category" onclick="openCategory('${c.id}')">
        <div class="category-header">
          <div>
            <div class="category-title">${c.icon} ${c.title}</div>
            <div style="font-size:13px;color:#666;margin-top:4px;">${c.description}</div>
          </div>
          <div class="category-percent">${c.percent}%</div>
        </div>
        <div class="progress-bar" style="margin-top:8px;"><div class="progress-fill" style="width:${c.percent}%"></div></div>
      </div>
    `).join('')}
  `;
}

window.openCategory = async (id) => {
  try {
    state.category = state.categories.find(c => c.id === id);
    state.checklists = await loadChecklists(id);
    state.screen = 'list';
    render();
  } catch (e) {
    console.error('Error:', e);
  }
};

function getStatus(id) {
  const progress = getProgress();
  const opened = getOpened();
  if (progress[id]) return { text: 'Completed', class: 'done' };
  if (opened[id]) return { text: 'In Progress', class: 'progress' };
  return { text: 'New', class: 'new' };
}

function renderList() {
  const price = getPrice();
  const cat = state.category;

  const sorted = [...state.checklists].sort((a, b) => {
    const statusA = getStatus(a.id);
    const statusB = getStatus(b.id);
    const lockedA = needsPayment(a, cat);
    const lockedB = needsPayment(b, cat);
    
    const getPriority = (status, locked) => {
      if (status.class === 'progress') return 0;
      if (status.class === 'new' && !locked) return 1;
      if (status.class === 'new' && locked) return 2;
      return 3;
    };
    
    return getPriority(statusA, lockedA) - getPriority(statusB, lockedB);
  });

  app.innerHTML = `
    <button class="btn btn-ghost" onclick="goBack()">← Back</button>
    <h2 style="margin-top:8px;">${cat.icon} ${cat.title}</h2>
    <p style="font-size:13px;color:#666;margin-bottom:16px;">${cat.description}</p>
    ${sorted.map(c => {
      const s = getStatus(c.id);
      const locked = needsPayment(c, cat);
      return `
        <div class="card" onclick="${locked ? `window.showPay('${c.id}', '${c.title.replace(/'/g, "\\'")}')` : `openChecklist('${c.id}')`}">
          <div class="card-row">
            <div>
              <div style="font-weight:700;font-size:16px;">${locked ? '🔒 ' : '📖 '}${c.title}</div>
              ${c.subtitle ? `<div class="checklist-subtitle">${c.subtitle}</div>` : ''}
            </div>
            <div style="text-align:right;">
              <div class="status ${s.class}">${s.text}</div>
              ${locked ? `<div style="font-size:13px;font-weight:600;color:#ff9500;margin-top:4px;">${price} ⭐</div>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('')}
  `;

  // Scroll to top of page
  window.scrollTo(0, 0);
}

window.showPay = (id, title) => {
  const checklist = state.checklists.find(c => c.id === id);
  const subtitle = checklist?.subtitle || '';
  showPaymentModal(id, title, subtitle, () => openChecklist(id));
};

window.openChecklist = (id) => {
  setOpened(id);
  state.current = state.checklists.find(x => x.id === id);
  state.screen = 'check';
  
  // Opening tracking
  try {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const user = tg.initDataUnsafe?.user;
      if (user?.id) {
        fetch(`${WORKER_URL}/api/track-event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            event: 'checklist_open',
            data: {
              checklist_id: id,
              checklist_title: state.current?.title || id,
              category_id: state.category?.id || '',
              category_title: state.category?.title || '',
              category_icon: state.category?.icon || ''
            }
          })
        }).catch(() => {});
      }
    }
  } catch (e) {}
  
  render();
};

function renderCheck() {
  const c = state.current;
  app.innerHTML = `
    <button class="btn btn-ghost" onclick="goBack()">← Back</button>
    <h2>${c.title}</h2>
    ${c.description ? `<div class="checklist-description">${c.description}</div>` : ''}
    ${(c.items || []).map((item, i) => `
      <div class="item">
        <div class="item-header" onclick="toggle(${i})">${item.emoji} ${item.title}</div>
        <div class="item-body" id="i${i}">
          <p>${item.text}</p>
          ${item.source ? `<div style="font-size:12px;color:#888;margin-top:8px;">📚 ${item.source}</div>` : ''}
          ${item.tip ? `<div style="margin-top:8px;padding:10px;background:#f2f2f7;border-radius:10px;font-size:13px;">💡 ${item.tip}</div>` : ''}
        </div>
      </div>
    `).join('')}
    ${renderQuiz(c)}
  `;
}

window.toggle = (i) => {
  const items = document.querySelectorAll('.item');
  const body = document.getElementById('i' + i);
  if (!items[i] || !body) return;
  const isOpen = body.style.display === 'block';
  body.style.display = isOpen ? 'none' : 'block';
  items[i].classList.toggle('open');
};

function renderQuiz(c) {
  if (!c.quiz || !c.quiz.length) return '';
  return `
    <div class="quiz-section">
      <div class="quiz-title">🧠 Mini Quiz</div>
      ${c.quiz.map((q, i) => `
        <div class="quiz-question">
          <p>${q.q}</p>
          ${q.a.map((a, j) => `<label class="quiz-option"><input type="radio" name="q${i}" value="${j}"> ${a}</label>`).join('')}
        </div>
      `).join('')}
      <div style="text-align:center;margin-top:12px;"><button class="btn btn-primary" onclick="checkQuiz()">Check</button></div>
    </div>
  `;
}

window.checkQuiz = () => {
  const c = state.current;
  let score = 0;
  let all = true;
  
  c.quiz.forEach((q, i) => {
    const v = document.querySelector(`input[name="q${i}"]:checked`);
    if (!v) all = false;
    if (v && Number(v.value) === q.correct) score++;
  });

  if (!all) { alert('Answer all questions'); return; }

  const modal = document.createElement('div');
  modal.className = 'modal';
  const ok = score === c.quiz.length;
  if (ok) {
    setDone(c.id);
    trackChecklistComplete(c.id, c.title);
  }

  modal.innerHTML = ok ? `
    <div class="modal-content">
      <h3>🎉 Excellent!</h3><p>${score}/${c.quiz.length}</p>
      <p>You've completed the checklist 🚀</p>
      <button class="btn btn-primary" onclick="closeModal(true)">Finish</button>
    </div>
  ` : `
    <div class="modal-content">
      <h3>Result</h3><p>${score}/${c.quiz.length}</p>
      <p>Try again 🎯</p>
      <button class="btn btn-primary" onclick="closeModal(false)">Go Back</button>
    </div>
  `;
  
  document.body.appendChild(modal);
};

window.closeModal = (done) => {
  const m = document.querySelector('.modal');
  if (m) m.remove();
  if (done) goBack();
};

window.goBack = () => {
  if (state.screen === 'check') state.screen = 'list';
  else state.screen = 'categories';
  render();
};

init();
