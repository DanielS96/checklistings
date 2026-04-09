export const UI = {

  progress(done, total){
    const percent = total ? Math.round(done/total*100) : 0

    return `
      <div class="card">
        <div class="progress-title">Общий прогресс</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${percent}%"></div>
        </div>
      </div>
    `
  },

  category(cat){
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
  },

  checklist(c){
    return `
      <div class="card" onclick="openChecklist('${c.id}')">
        <div class="check-title">${c.title}</div>
        <div class="check-sub">${c.subtitle}</div>
      </div>
    `
  },

  checklistHeader(c){
    return `
      <h1>${c.title}</h1>
      <p>${c.subtitle}</p>
      <div class="card">${c.description}</div>
    `
  },

  item(item, i){
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
  },

  quiz(c){
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

}
