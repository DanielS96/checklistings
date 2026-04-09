import { loadCategories, loadChecklists } from './api.js'
import { renderChecklist } from './checklist.js'

const app = document.getElementById('app')

let categories = []
let currentCategory = null
let currentChecklist = null

window.openCategory = async (id)=>{
  currentCategory = categories.find(c=>c.id===id)
  currentCategory.checklists = await loadChecklists(id)

  renderCategory()
}

window.openChecklist = (id)=>{
  currentChecklist = currentCategory.checklists.find(c=>c.id===id)
  renderChecklistScreen()
}

window.finishChecklist = (id)=>{
  localStorage.setItem(id,'done')
  renderCategory()
}

/* RENDER */

function renderCategories(){
  app.innerHTML = categories.map(c=>`
    <div onclick="openCategory('${c.id}')">
      ${c.icon} ${c.title}
    </div>
  `).join('')
}

function renderCategory(){
  app.innerHTML = `
    <button onclick="renderCategories()">← Назад</button>

    ${currentCategory.checklists.map(cl=>`
      <div onclick="openChecklist('${cl.id}')">
        ${cl.title}
      </div>
    `).join('')}
  `
}

function renderChecklistScreen(){
  app.innerHTML = `
    <button onclick="renderCategory()">← Назад</button>
    ${renderChecklist(currentChecklist)}
  `
}

/* START */

loadCategories().then(data=>{
  categories = data
  renderCategories()
})
