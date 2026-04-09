export function renderChecklist(c){

  return `
    <div class="header">
      <h2>${c.title}</h2>
      <p>${c.description}</p>
    </div>

    ${c.items.map(i=>`
      <details>
        <summary>${i.emoji} ${i.title}</summary>
        <div class="content">
          <div class="source">${i.source}</div>
          <div>${i.text}</div>
          <div class="tip"><b>Совет:</b> ${i.tip}</div>
        </div>
      </details>
    `).join('')}

    <button onclick="finishChecklist('${c.id}')">Завершить</button>
  `
}
