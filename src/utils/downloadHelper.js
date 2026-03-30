export const downloadBlob = (blob, filename) => {
  // Ensure we actually have a Blob object with the correct type
  const safeBlob = blob instanceof Blob 
    ? blob 
    : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

  // Handle IE / Edge fallback
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(safeBlob, filename)
    
    return
  }

  const url = window.URL.createObjectURL(safeBlob)
  const a = document.createElement('a')
  
  // Set all necessary attributes to try and force the download filename
  a.style.display = 'none'
  a.href = url
  a.download = filename
  
  // Rel attribute to prevent tab hijacking or referrer leakage for security
  a.rel = 'noopener noreferrer'

  // Append to body and click
  document.body.appendChild(a)
  
  // Trigger click asynchronously to completely escape any Vue/Router event loop
  setTimeout(() => {
    a.click()
    
    // Defer removal deeply to prevent browser cancellation
    setTimeout(() => {
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }, 5000) // 5 seconds is very safe
  }, 10)
}
