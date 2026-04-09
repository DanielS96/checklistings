import { loadCategories, loadChecklists } from './api.js'
import { renderChecklist } from './checklist.js'

const app = document.getElementById('app')

let categories = []
let currentCategory = null
let currentChecklist = null

/* GLOBAL FUNCTIONS */

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

/* PROGRESS */

function isDone(id){
  return localStorage.getItem(id)==='done'
}

function categoryProgress(cat){
  let done = cat.checklists.filter(c=>isDone(c.id)).length
  return Math.round(done/cat.checklists.length*100)
}

function globalProgress(){
  let all=[]
  categories.forEach(c=>{
    if(c.checklists) all=all.concat(c.checklists)
  })
  let done = all.filter(c=>isDone(c.id)).length
  return all.length ? Math.round(done/all.length*100) : 0
}

/* ANIMATION */

function animate(){
  app.classList.remove('fade')
  void app.offsetWidth
  app.classList.add('fade')
}

/* RENDER */

async function renderCategories(){

  for(let c of categories){
    c.checklists = await loadChecklists(c.id)
  }

  app.innerHTML = `
    <h1>Checklistings</h1>
    <div class="subtitle">Система развития</div>

    <div class="card global">
      <div class="card-title">Общий прогресс</div>
      <div>${globalProgress()}%</div>

      <div class="progress">
        <div class="fill" style="width:${globalProgress()}%"></div>
      </div>
    </div>

    ${categories.map(c=>`
      <div class="card" onclick="openCategory('${c.id}')">
        <div class="card-title">${c.icon} ${c.title}</div>
        <div class="card-sub">${c.description || ''}</div>

        <div class="progress">
          <div class="fill" style="width:${categoryProgress(c)}%"></div>
        </div>
      </div>
    `).join('')}
  `

  animate()
}

function renderCategory(){
  app.innerHTML = `
    <button onclick="renderCategories()">← Назад</button>
    <h2>${currentCategory.title}</h2>

    ${currentCategory.checklists.map(cl=>`
      <div class="card" onclick="openChecklist('${cl.id}')">
        <div class="card-title">${cl.title}</div>
        <div class="card-sub">${cl.subtitle || ''}</div>

        <div class="badge ${isDone(cl.id)?'done':'inprogress'}">
          ${isDone(cl.id)?'Выполнено':'В процессе'}
        </div>
      </div>
    `).join('')}
  `

  animate()
}

function renderChecklistScreen(){
  app.innerHTML = `
    <button onclick="renderCategory()">← Назад</button>
    ${renderChecklist(currentChecklist)}
  `
  animate()
}

/* START */

loadCategories().then(data=>{
  categories = data
  renderCategories()
})
