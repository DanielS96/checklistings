import { loadCategories, loadChecklists } from './api.js'
import { UI } from './components.js'

const app = document.getElementById('app')

let state = {
  categories: [],
  checklists: [],
  category: null
}

const getProgress = ()=>JSON.parse(localStorage.getItem('progress')||'{}')

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
    <button onclick="renderCategories()">← Назад</button>

    ${state.checklists.map(UI.checklist).join('')}
  `
}

// CHECKLIST
window.openChecklist = (id)=>{
  const c = state.checklists.find(x=>x.id===id)

  app.innerHTML = `
    <button onclick="openCategory('${state.category}')">← Назад</button>

    <h1>${c.title}</h1>

    ${c.items.map(UI.item).join('')}
  `
}

window.toggle = (i)=>{
  const el = document.getElementById('i'+i)
  el.style.display = el.style.display==='block'?'none':'block'
}

init()
