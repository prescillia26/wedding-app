/**
 * Upload a file to Vercel Blob via /api/upload
 * Returns the public URL or null on failure
 */
export async function uploadFile(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  try {
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    return json.url || null
  } catch {
    return null
  }
}
