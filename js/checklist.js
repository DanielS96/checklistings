export function renderChecklist(checklist){

  return `
    <h2>${checklist.title}</h2>
    <p>${checklist.description}</p>

    ${checklist.items.map(i=>`
      <details>
        <summary>${i.emoji} ${i.title}</summary>
        <div>
          <div>${i.source}</div>
          <div>${i.text}</div>
          <div><b>Совет:</b> ${i.tip}</div>
        </div>
      </details>
    `).join('')}

    <button onclick="finishChecklist('${checklist.id}')">Завершить</button>
  `
}
