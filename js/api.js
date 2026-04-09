export async function loadCategories(){
  const res = await fetch('./data/categories.json')
  return res.json()
}

export async function loadChecklists(categoryId){
  const files = await fetch(`./data/${categoryId}/index.json`)
    .then(r=>r.json())

  return Promise.all(
    files.map(f =>
      fetch(`./data/${categoryId}/${f}`)
        .then(r=>r.json())
    )
  )
}
