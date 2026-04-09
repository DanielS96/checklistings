export function renderChecklist(c){

  return `
    <h2>${c.title}</h2>
    <p>${c.description}</p>

    ${c.items.map(i=>`
      <details>
        <summary>${i.emoji} ${i.title}</summary>
        <div>
          <div>${i.source}</div>
          <div>${i.text}</div>
          <div><b>Совет:</b> ${i.tip}</div>
        </div>
      </details>
    `).join('')}

    <button onclick="finishChecklist('${c.id}')">Завершить</button>
  `
}
