export async function loadCategories(){
  return fetch('./data/categories.json?v=' + Date.now())
    .then(r=>r.json())
}

export async function loadChecklists(categoryId){
  const files = await fetch(`./data/${categoryId}/index.json?v=` + Date.now())
    .then(r=>r.json())

  return Promise.all(
    files.map(f =>
      fetch(`./data/${categoryId}/${f}?v=` + Date.now())
        .then(r=>r.json())
    )
  )
}
