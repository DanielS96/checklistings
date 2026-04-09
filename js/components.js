export function renderProgress(done, total){
  const percent = total ? (done/total)*100 : 0

  return `
    <div class="card">
      <b>Общий прогресс</b>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `
}

export function renderCategoryCard(cat){
  return `
    <div class="card category" onclick="openCategory('${cat.id}')">
      <div class="category-title">${cat.emoji} ${cat.title}</div>
      <div class="category-desc">${cat.description}</div>
    </div>
  `
}

export function renderChecklistCard(c){
  return `
    <div class="card checklist-card" onclick="openChecklist('${c.id}')">
      <b>${c.title}</b>
      <div>${c.subtitle}</div>
    </div>
  `
}

export function renderItem(item, i){
  return `
    <div class="item">
      <div class="item-header" onclick="toggleItem(${i})">
        ${item.emoji} ${item.title}
      </div>
      <div class="item-body" id="item-${i}">
        <p><b>Источник:</b> ${item.source}</p>
        <p>${item.text}</p>
        <div class="tip">💡 ${item.tip}</div>
      </div>
    </div>
  `
}

export function renderQuiz(c){
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
    <div id="quiz-result"></div>
  `
}
