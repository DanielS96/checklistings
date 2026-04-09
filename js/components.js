export function Progress(done, total){
  const percent = total ? Math.round((done/total)*100) : 0

  return `
    <div class="card progress-card">
      <b>Общий прогресс</b>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${percent}%"></div>
      </div>
    </div>
  `
}

export function CategoryCard(cat){
  return `
    <div class="card category" onclick="openCategory('${cat.id}')">
      <div class="category-title">
        ${cat.emoji || '❓'} ${cat.title}
      </div>
      <div class="category-desc">
        ${cat.description}
      </div>
    </div>
  `
}

export function ChecklistCard(c){
  return `
    <div class="card checklist" onclick="openChecklist('${c.id}')">
      <b>${c.title}</b>
      <div>${c.subtitle}</div>
    </div>
  `
}

export function ChecklistHeader(c){
  return `
    <h1>${c.title}</h1>
    <p>${c.subtitle}</p>
    <div class="card">${c.description}</div>
  `
}

export function Item(item, i){
  return `
    <div class="item">
      <div class="item-header" onclick="toggle(${i})">
        ${item.emoji} ${item.title}
      </div>
      <div class="item-body" id="i${i}">
        <p><b>Источник:</b> ${item.source}</p>
        <p>${item.text}</p>
        <div class="tip">💡 ${item.tip}</div>
      </div>
    </div>
  `
}

export function Quiz(c){
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
