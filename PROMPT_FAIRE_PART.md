Dans app/faire-part/page.tsx, dans la fonction handleShare, remplace navigator.clipboard.writeText par cette version avec fallback :

try {
  await navigator.clipboard.writeText(url)
} catch {
  const el = document.createElement('textarea')
  el.value = url
  el.style.position = 'fixed'
  el.style.opacity = '0'
  document.body.appendChild(el)
  el.focus()
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

Faire git add -A && git commit -m "Fix copier lien" && git push