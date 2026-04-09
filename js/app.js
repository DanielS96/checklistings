import { loadCategories, loadChecklists } from './api.js'
import { UI } from './components.js'

const app = document.getElementById('app')

let state = {
  categories: [],
  category: null,
  checklists: [],
  current: null
}

// STORAGE
const getProgress = ()=>JSON.parse(localStorage.getItem('progress')||'{}')

const setDone = (id)=>{
  const p = getProgress()
  p[id] = true
  localStorage.setItem('progress', JSON.stringify(p))
}

// INIT
async function init(){
  state.categories = await loadCategories()
  renderCategories()
}

// MAIN
function renderCategories(){
  const progress = getProgress()

  app.innerHTML = `
    <h1>Checklistings</h1>

    ${UI.progress(Object.keys(progress).length, 10)}

    ${state.categories.map(UI.category).join('')}
  `
}

// CATEGORY
window.openCategory = async (id)=>{
  state.category = id
  state.checklists = await loadChecklists(id)

  app.innerHTML = `
    <button class="back" onclick="renderCategories()">← Назад</button>

    ${state.checklists.map(UI.checklist).join('')}
  `
}

// CHECKLIST
window.openChecklist = (id)=>{
  const c = state.checklists.find(x=>x.id===id)
  state.current = c

  app.innerHTML = `
    <button class="back" onclick="openCategory('${state.category}')">← Назад</button>

    ${UI.checklistHeader(c)}

    ${c.items.map((item,i)=>UI.item(item,i)).join('')}

    ${UI.quiz(c)}
  `
}

// INTERACTIONS
window.toggle = (i)=>{
  const el = document.getElementById('i'+i)
  el.style.display = el.style.display==='block'?'none':'block'
}

window.checkQuiz = ()=>{
  const c = state.current
  let score = 0

  c.quiz.forEach((q,i)=>{
    const v = document.querySelector(`input[name="q${i}"]:checked`)
    if(v && Number(v.value)===q.correct) score++
  })

  document.getElementById('quiz-result').innerHTML = `
    <div class="card">
      Результат: ${score}/${c.quiz.length}
      <button onclick="finish('${c.id}')">Завершить</button>
    </div>
  `
}

window.finish = (id)=>{
  setDone(id)
  renderCategories()
}

init()
