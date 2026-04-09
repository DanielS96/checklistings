// js/api.js

export async function loadCategories(){
  try {
    const res = await fetch('./data/categories.json?v=' + Date.now())

    if (!res.ok) {
      throw new Error('Не удалось загрузить categories.json')
    }

    return await res.json()

  } catch (e) {
    console.error('Ошибка загрузки категорий:', e)
    alert('Ошибка загрузки категорий')
    return []
  }
}


export async function loadChecklists(categoryId){
  try {
    // грузим список файлов
    const res = await fetch(`./data/${categoryId}/index.json?v=` + Date.now())

    if (!res.ok) {
      throw new Error(`Нет index.json в категории: ${categoryId}`)
    }

    const files = await res.json()

    // грузим сами чек-листы
    const checklists = await Promise.all(
      files.map(async (file) => {
        const r = await fetch(`./data/${categoryId}/${file}?v=` + Date.now())

        if (!r.ok) {
          throw new Error(`Ошибка загрузки файла: ${file}`)
        }

        return await r.json()
      })
    )

    return checklists

  } catch (e) {
    console.error('Ошибка загрузки чек-листов:', e)
    alert('Ошибка загрузки чек-листов')
    return []
  }
}
