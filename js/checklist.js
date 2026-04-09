import { renderItem, renderQuiz } from './components.js'

const app = document.getElementById('app')

const setDone = (id)=>{
  const p = JSON.parse(localStorage.getItem('progress') || '{}')
  p[id] = true
  localStorage.setItem('progress', JSON.stringify(p))
}

export function renderChecklistScreen(c, goBack){
  app.innerHTML = `
    <button class="back" onclick="goBackChecklist()">← Назад</button>

    <h1>${c.title}</h1>
    <p>${c.subtitle}</p>

    <div class="card">${c.description}</div>

    ${c.items.map(renderItem).join('')}

    ${renderQuiz(c)}
  `

  window.goBackChecklist = goBack
}

window.toggleItem = (i)=>{
  const el = document.getElementById('item-'+i)
  el.style.display = el.style.display==='block'?'none':'block'
}

window.checkQuiz = ()=>{
  const questions = document.querySelectorAll('[name^="q"]')
  const quiz = window.currentChecklist?.quiz

  let score = 0

  quiz.forEach((q,i)=>{
    const checked = document.querySelector(`input[name="q${i}"]:checked`)
    if(checked && Number(checked.value) === q.correct){
      score++
    }
  })

  document.getElementById('quiz-result').innerHTML = `
    <div class="card">
      Результат: ${score}/${quiz.length}
      <button onclick="finishChecklist('${window.currentChecklist.id}')">
        Завершить
      </button>
    </div>
  `
}

window.finishChecklist = (id)=>{
  setDone(id)
  alert('Чек-лист завершён ✅')
}
