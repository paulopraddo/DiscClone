const STORAGE_KEY = 'discclone:userId'

export function getLocalUserId(): string {
  let id = localStorage.getItem(STORAGE_KEY)

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }

  return id
}
