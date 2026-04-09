import { loadCategories, loadChecklists } from './api.js'
import { renderProgress, renderCategoryCard, renderChecklistCard } from './components.js'
import { renderChecklistScreen } from './checklist.js'

const app = document.getElementById('app')

let state = {
  categories: [],
  checklists: [],
  currentCategory: null
}

const getProgress = () => JSON.parse(localStorage.getItem('progress') || '{}')

// ===== MAIN SCREEN =====

async function init(){
  state.categories = await loadCategories()
  renderCategories()
}

function renderCategories(){
  const progress = getProgress()

  app.innerHTML = `
    <div class="header">
      <h1>Checklistings</h1>
    </div>

    ${renderProgress(Object.keys(progress).length, 10)}

    ${state.categories.map(renderCategoryCard).join('')}
  `
}

// ===== CATEGORY =====

window.openCategory = async (id)=>{
  state.currentCategory = id
  state.checklists = await loadChecklists(id)

  app.innerHTML = `
    <button class="back" onclick="goBack()">← Назад</button>

    ${state.checklists.map(renderChecklistCard).join('')}
  `
}

window.goBack = ()=>{
  state.currentCategory = null
  renderCategories()
}

// ===== CHECKLIST =====

window.openChecklist = (id)=>{
  const checklist = state.checklists.find(c=>c.id===id)
  renderChecklistScreen(checklist, goBackToCategory)
}

function goBackToCategory(){
  openCategory(state.currentCategory)
}

// INIT
init()
