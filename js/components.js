export const UI = {
  progress(done, total){
    const percent = total ? Math.round(done/total*100) : 0

    return `
      <div class="card progress">
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
      <div class="card checklist" onclick="openChecklist('${c.id}')">
        <div class="check-title">${c.title}</div>
        <div class="check-sub">${c.subtitle}</div>
      </div>
    `
  },

  item(item, i){
    return `
      <div class="item">
        <div class="item-header" onclick="toggle(${i})">
          ${item.emoji} ${item.title}
        </div>
        <div class="item-body" id="i${i}">
          <div class="source">${item.source}</div>
          <div>${item.text}</div>
          <div class="tip">${item.tip}</div>
        </div>
      </div>
    `
  }
}
