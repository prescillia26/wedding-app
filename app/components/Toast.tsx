const GOLD = '#C9A84C'

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const el = document.createElement('div')
  el.style.cssText = `position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:10000;padding:12px 24px;border-radius:12px;background:${type === 'error' ? '#fef2f2' : 'white'};border:1px solid ${type === 'error' ? '#fecaca' : GOLD + '44'};color:${type === 'error' ? '#dc2626' : '#3a3330'};font-size:14px;font-family:Georgia,serif;font-style:italic;box-shadow:0 4px 20px rgba(0,0,0,0.12);animation:toastIn 0.3s ease;pointer-events:none;`
  el.textContent = (type === 'error' ? '' : '✓ ') + message
  const style = document.createElement('style')
  style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}'
  el.appendChild(style)
  document.body.appendChild(el)
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s ease' }, 2500)
  setTimeout(() => el.remove(), 2800)
}
