import { loadCategories, loadChecklists } from './api.js'

const app = document.getElementById('app')

let state = {
  categories: [],
  category: null,
  checklists: [],
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
  console.log('CATEGORIES:', state.categories)
  renderCategories()
}

// ===== CATEGORIES =====
function renderCategories(){
  const progress = getProgress()

  const total = 10
  const done = Object.keys(progress).length
  const percent = Math.round((done / total) * 100)

  app.innerHTML = `
    <h1>Checklistings</h1>

    <div class="card progress-card">
      <b>Общий прогресс</b>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
    </div>

    ${state.categories.map(cat=>`
      <div class="card category" onclick="openCategory('${cat.id}')">
        <div class="category-title">
          ${cat.emoji || '❓'} ${cat.title}
        </div>
        <div class="category-desc">
          ${cat.description}
        </div>
      </div>
    `).join('')}
  `
}

// ===== CATEGORY =====
window.openCategory = async (id)=>{
  state.category = id
  state.checklists = await loadChecklists(id)

  app.innerHTML = `
    <button class="back" onclick="renderCategories()">← Назад</button>

    ${state.checklists.map(c=>`
      <div class="card checklist" onclick="openChecklist('${c.id}')">
        <b>${c.title}</b>
        <div>${c.subtitle}</div>
      </div>
    `).join('')}
  `
}

// ===== CHECKLIST =====
window.openChecklist = (id)=>{
  const c = state.checklists.find(x=>x.id===id)
  state.current = c

  app.innerHTML = `
    <button class="back" onclick="openCategory('${state.category}')">← Назад</button>

    <h1>${c.title}</h1>
    <p>${c.subtitle}</p>

    <div class="card">${c.description}</div>

    ${c.items.map((item,i)=>`
      <div class="item">
        <div class="item-header" onclick="toggle(${i})">
          ${item.emoji} ${item.title}
        </div>
        <div class="item-body" id="i${i}">
          <p>${item.text}</p>
        </div>
      </div>
    `).join('')}

    ${renderQuiz(c)}
  `
}

// ===== TOGGLE =====
window.toggle = (i)=>{
  const el = document.getElementById('i'+i)
  el.style.display = el.style.display==='block'?'none':'block'
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
  alert('Готово ✅')
  renderCategories()
}

init()
