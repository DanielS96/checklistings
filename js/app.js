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
const getOpened = () => JSON.parse(localStorage.getItem('opened') || '{}')

const setDone = (id)=>{
  const p = getProgress()
  p[id] = true
  localStorage.setItem('progress', JSON.stringify(p))
}

const setOpened = (id)=>{
  const o = getOpened()
  o[id] = true
  localStorage.setItem('opened', JSON.stringify(o))
}

// LEVEL
function getLevel(percent){
  if(percent < 20) return 'Новичок'
  if(percent < 50) return 'Любитель'
  if(percent < 80) return 'Продвинутый'
  return 'Мастер'
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
async function renderCategories(){
  const progress = getProgress()

  const totalDone = Object.keys(progress).length
  const percent = Math.round(totalDone / 10 * 100)

  const level = getLevel(percent)

  const categoriesWithProgress = await Promise.all(
    state.categories.map(async (c)=>{
      const lists = await loadChecklists(c.id)
      const total = lists.length
      const done = lists.filter(l => progress[l.id]).length
      const percent = total ? Math.round(done / total * 100) : 0

      return { ...c, percent }
    })
  )

  categoriesWithProgress.sort((a,b)=> b.percent - a.percent)

  app.innerHTML = `
    <h1>Checklistings</h1>

    <div class="dashboard">
      <div class="dashboard-title">Общий уровень</div>
      <div class="dashboard-level">${level}</div>

      <div class="dashboard-bar">
        <div class="dashboard-fill" style="width:${percent}%"></div>
      </div>

      <div style="margin-top:6px;">${percent}% завершено</div>
    </div>

    ${categoriesWithProgress.map(c=>`
      <div class="card category" onclick="openCategory('${c.id}')">

        <div class="category-header">
          <div class="category-title">${c.icon} ${c.title}</div>
          <div class="category-percent">${c.percent}%</div>
        </div>

        <div class="category-desc">${c.description}</div>

        <div class="progress-bar">
          <div class="progress-fill" style="width:${c.percent}%"></div>
        </div>

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

function getStatus(id){
  const progress = getProgress()
  const opened = getOpened()

  if(progress[id]) return {text:'✅ Завершен', class:'done'}
  if(opened[id]) return {text:'⏳ Не завершен', class:'progress'}
  return {text:'🆕 Новый', class:'new'}
}

function renderList(){
  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    ${state.checklists.map(c=>{
      const s = getStatus(c.id)

      return `
        <div class="card" onclick="openChecklist('${c.id}')">
          <b>${c.title}</b>
          <div>${c.subtitle}</div>
          <div class="status ${s.class}">${s.text}</div>
        </div>
      `
    }).join('')}
  `
}

// ===== CHECKLIST =====
window.openChecklist = (id)=>{
  setOpened(id)

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
    <h3>🧠 Тест</h3>

    ${c.quiz.map((q,i)=>`
      <div class="quiz-question">
        <p>${q.q}</p>

        ${q.a.map((a,j)=>`
          <label class="quiz-option">
            <input type="radio" name="q${i}" value="${j}">
            ${a}
          </label>
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

  if(score === c.quiz.length){
    setDone(c.id)
    launchConfetti()
  }

  document.getElementById('result').innerHTML = `
    <div class="card">
      Результат: ${score}/${c.quiz.length}
      <button onclick="goBack()">Назад</button>
    </div>
  `
}

// CONFETTI
function launchConfetti(){
  const el = document.createElement('div')
  el.className = 'confetti'
  el.innerHTML = '🎉🎉🎉🎉🎉'
  document.body.appendChild(el)

  setTimeout(()=> el.remove(), 1500)
}

// BACK
window.goBack = ()=>{
  if(state.screen === 'check') state.screen = 'list'
  else state.screen = 'categories'
  render()
}

init()
