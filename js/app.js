import { loadCategories, loadChecklists } from './api.js'

const app = document.getElementById('app')

let state = {
  screen: 'categories',
  categories: [],
  category: null,
  checklists: [],
  current: null
}

// STORAGE
const getProgress = () => JSON.parse(localStorage.getItem('progress') || '{}')

const setDone = (id)=>{
  const p = getProgress()
  p[id] = true
  localStorage.setItem('progress', JSON.stringify(p))
}

// INIT
async function init(){
  state.categories = await loadCategories()
  render()
}

// ROUTER
function render(){
  if(state.screen === 'categories') renderCategories()
  if(state.screen === 'list') renderList()
  if(state.screen === 'check') renderCheck()
}

// ===== CATEGORIES =====
function renderCategories(){
  const progress = getProgress()
  const percent = Math.round(Object.keys(progress).length / 10 * 100)

  app.innerHTML = `
    <h1>Checklistings</h1>

    <div class="card">
      Общий прогресс
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
    </div>

    ${state.categories.map(c=>`
      <div class="card category" onclick="openCategory('${c.id}')">
        <div class="category-title">${c.icon} ${c.title}</div>
        <div class="category-desc">${c.description}</div>
      </div>
    `).join('')}
  `
}

// ===== CATEGORY =====
window.openCategory = async (id)=>{
  state.category = id
  state.checklists = await loadChecklists(id)
  state.screen = 'list'
  render()
}

function renderList(){
  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    ${state.checklists.map(c=>`
      <div class="card" onclick="openChecklist('${c.id}')">
        <b>${c.title}</b>
        <div>${c.subtitle}</div>
      </div>
    `).join('')}
  `
}

// ===== CHECKLIST =====
window.openChecklist = (id)=>{
  state.current = state.checklists.find(x=>x.id===id)
  state.screen = 'check'
  render()
}

function renderCheck(){
  const c = state.current

  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    <h2>${c.title}</h2>
    <p class="checklist-description">${c.subtitle}</p>

    <p class="checklist-description">${c.description}</p>

    ${c.items.map((item,i)=>`
      <div class="item">
        <div class="item-header" onclick="toggle(${i})">
          <span>${item.emoji} ${item.title}</span>
        </div>
        <div class="item-body" id="i${i}">
          <p><b>Источник:</b> ${item.source}</p>
          <p>${item.text}</p>
          <p class="tip">${item.tip}</p>
        </div>
      </div>
    `).join('')}

    ${renderQuiz(c)}
  `
}

// ===== TOGGLE =====
window.toggle = (i)=>{
  const item = document.querySelectorAll('.item')[i]
  const body = document.getElementById('i'+i)

  const isOpen = body.style.display === 'block'

  body.style.display = isOpen ? 'none' : 'block'
  item.classList.toggle('open')
}

// ===== QUIZ =====
function renderQuiz(c){
  if(!c.quiz) return ''

  return `
    <div class="quiz">
      <h3>🧠 Мини-тест</h3>

      ${c.quiz.map((q,i)=>`
        <div class="quiz-question">
          <p class="quiz-q">${q.q}</p>

          ${q.a.map((a,j)=>`
            <label class="quiz-option">
              <input type="radio" name="q${i}" value="${j}">
              <span>${a}</span>
            </label>
          `).join('')}
        </div>
      `).join('')}

      <button onclick="checkQuiz()">Проверить</button>
      <div id="result"></div>
    </div>
  `
}

window.checkQuiz = ()=>{
  const c = state.current
  let score = 0

  c.quiz.forEach((q,i)=>{
    const v = document.querySelector(`input[name="q${i}"]:checked`)
    if(v && Number(v.value)===q.correct) score++
  })

  document.getElementById('result').innerHTML = `
    <div class="card">
      Результат: ${score}/${c.quiz.length}
      <button onclick="finish('${c.id}')">Завершить</button>
    </div>
  `
}

// ===== FINISH =====
window.finish = (id)=>{
  setDone(id)
  goBack()
}

// ===== BACK =====
window.goBack = ()=>{
  if(state.screen === 'check') state.screen = 'list'
  else state.screen = 'categories'
  render()
}

init()
