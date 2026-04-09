export async function loadCategories(){
  return fetch('data/categories.json').then(r=>r.json())
}

export async function loadChecklists(categoryId){
  const files = await fetch(`data/${categoryId}/index.json`)
    .then(r=>r.json())

  return Promise.all(
    files.map(f =>
      fetch(`data/${categoryId}/${f}`).then(r=>r.json())
    )
  )
}
