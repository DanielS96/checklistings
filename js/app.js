import { loadCategories, loadChecklists } from './api.js'

const app = document.getElementById('app')

let state = {
  screen: 'categories',
  categories: [],
  checklists: {},
  category: null,
  current: null
}

// ===== STORAGE =====
const getProgress = () => JSON.parse(localStorage.getItem('progress') || '{}')

const setDone = (id)=>{
  const p = getProgress()
  p[id] = true
  localStorage.setItem('progress', JSON.stringify(p))
}

// ===== INIT =====
async function init(){
  state.categories = await loadCategories()

  // заранее грузим чек-листы для прогресса
  for(const c of state.categories){
    state.checklists[c.id] = await loadChecklists(c.id)
  }

  render()
}

// ===== ROUTER =====
function render(){
  if(state.screen === 'categories') renderCategories()
  if(state.screen === 'list') renderList()
  if(state.screen === 'check') renderCheck()
}

// ===== CALC =====
function getCategoryProgress(categoryId){
  const progress = getProgress()
  const list = state.checklists[categoryId] || []

  const total = list.length
  const done = list.filter(c => progress[c.id]).length

  const percent = total ? Math.round(done / total * 100) : 0

  return { total, done, percent }
}

// ===== CATEGORIES =====
function renderCategories(){
  const progress = getProgress()

  let totalAll = 0
  let doneAll = 0

  state.categories.forEach(c=>{
    const p = getCategoryProgress(c.id)
    totalAll += p.total
    doneAll += p.done
  })

  const percentAll = totalAll ? Math.round(doneAll / totalAll * 100) : 0

  app.innerHTML = `
    <h1>Checklistings</h1>

    <div class="card">
      <b>Общий прогресс</b>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percentAll}%"></div>
      </div>
      <div class="status">${percentAll}% завершено</div>
    </div>

    ${state.categories.map(c=>{
      const p = getCategoryProgress(c.id)

      return `
        <div class="card category" onclick="openCategory('${c.id}')">
          <div class="category-title">${c.icon} ${c.title}</div>
          <div class="category-desc">${c.description}</div>

          <div class="progress-bar">
            <div class="progress-fill" style="width:${p.percent}%"></div>
          </div>

          <div class="status">
            ${p.done}/${p.total} чек-листов • ${p.percent}%
          </div>
        </div>
      `
    }).join('')}
  `
}

// ===== CATEGORY =====
window.openCategory = (id)=>{
  state.category = id
  state.screen = 'list'
  render()
}

function renderList(){
  const progress = getProgress()
  const list = state.checklists[state.category]

  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    ${list.map(c=>{
      const done = progress[c.id]

      return `
        <div class="card" onclick="openChecklist('${c.id}')">
          <b>${c.title}</b>
          <div>${c.subtitle}</div>
          <div class="status">
            ${done ? '✅ Завершено' : '⏳ Не завершено'}
          </div>
        </div>
      `
    }).join('')}
  `
}

// ===== CHECKLIST =====
window.openChecklist = (id)=>{
  const list = state.checklists[state.category]
  state.current = list.find(x=>x.id===id)
  state.screen = 'check'
  render()
}

function renderCheck(){
  const c = state.current

  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    <h2>${c.title}</h2>
    <p>${c.subtitle}</p>

    <div class="card">${c.description}</div>

    ${c.items.map((item,i)=>`
      <div class="item">
        <div class="item-header" onclick="toggle(${i})">
          ${item.emoji} ${item.title}
        </div>
        <div class="item-body" id="i${i}">
          <p><b>Источник:</b> ${item.source}</p>
          <p>${item.text}</p>
          <p>${item.tip}</p>
        </div>
      </div>
    `).join('')}

    ${renderQuiz(c)}
  `
}

// ===== TOGGLE =====
window.toggle = (i)=>{
  const el = document.getElementById('i'+i)
  el.classList.toggle('open')
}

// ===== QUIZ =====
function renderQuiz(c){
  if(!c.quiz) return ''

  return `
    <h3>Тест</h3>

    ${c.quiz.map((q,i)=>`
      <div>
        <p>${q.q}</p>
        ${q.a.map((a,j)=>`
          <label>
            <input type="radio" name="q${i}" value="${j}">
            ${a}
          </label><br>
        `).join('')}
      </div>
    `).join('')}

    <button onclick="checkQuiz()">Проверить</button>
    <div id="result"></div>
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
  state.screen = 'categories'
  render()
}

// ===== BACK =====
window.goBack = ()=>{
  if(state.screen === 'check') state.screen = 'list'
  else state.screen = 'categories'
  render()
}

init()
