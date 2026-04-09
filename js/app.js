import { loadCategories, loadChecklists } from './api.js'

const app = document.getElementById('app')

let state = {
  categories: [],
  category: null,
  checklists: [],
  current: null
}

// ===== INIT =====
async function init(){
  state.categories = await loadCategories()
  renderCategories()
}

// ===== CATEGORIES =====
function renderCategories(){
  app.innerHTML = `
    <h1>Checklistings</h1>

    ${state.categories.map(cat=>`
      <div class="card category" onclick="openCategory('${cat.id}')">
        <div class="category-title">${cat.emoji} ${cat.title}</div>
        <div>${cat.description}</div>
      </div>
    `).join('')}
  `
}

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
    Результат: ${score}/${c.quiz.length}
  `
}

init()
