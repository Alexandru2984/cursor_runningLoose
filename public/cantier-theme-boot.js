;(function () {
  try {
    var raw = localStorage.getItem('cantier-settings')
    if (!raw) return
    var s = JSON.parse(raw)
    if (!s || typeof s !== 'object') return
    var themes = { dark: 1, light: 1, contrast: 1 }
    var fonts = { sm: 1, md: 1, lg: 1 }
    if (typeof s.theme === 'string' && themes[s.theme]) {
      document.documentElement.dataset.theme = s.theme
    }
    if (typeof s.fontScale === 'string' && fonts[s.fontScale]) {
      document.documentElement.dataset.font = s.fontScale
    }
  } catch (e) {
    /* ignore */
  }
})()
