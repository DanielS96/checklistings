export async function loadCategories() {
  try {
    const res = await fetch('data/categories.json')
    return await res.json()
  } catch (e) {
    console.error('Error loading categories.json', e)
    return []
  }
}

export async function loadChecklists(categoryId) {
  try {
    const res = await fetch(`data/${categoryId}/index.json`)
    const files = await res.json()

    if (!Array.isArray(files)) {
      console.error(`index.json in ${categoryId} is not an array`)
      return []
    }

    const results = await Promise.all(
      files.map(async (f) => {
        try {
          const r = await fetch(`data/${categoryId}/${f}`)

          if (!r.ok) {
            console.error(`File not found: ${categoryId}/${f}`)
            return null
          }

          const data = await r.json()

          return {
            id: data.id || f,
            title: data.title || 'Untitled',
            subtitle: data.subtitle || '',
            description: data.description || '',
            items: Array.isArray(data.items) ? data.items : [],
            quiz: Array.isArray(data.quiz) ? data.quiz : []
          }

        } catch (e) {
          console.error(`Error in file ${categoryId}/${f}`, e)
          return null
        }
      })
    )

    return results.filter(Boolean)

  } catch (e) {
    console.error(`Error loading index.json for ${categoryId}`, e)
    return []
  }
}
