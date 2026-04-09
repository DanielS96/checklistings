export function categoryCard(c, progress){
  return `
    <div class="card" onclick="openCategory('${c.id}')">
      <div>${c.icon} ${c.title}</div>
      <div>${c.description || ''}</div>
      <div>${progress}%</div>
    </div>
  `
}
