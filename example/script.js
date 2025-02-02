document.addEventListener('DOMContentLoaded', () => {
  const btns = document.querySelectorAll('.btns')

  btns.forEach(btn => {
    const spans = []
    for (let i = 0; i < 40; i++) {
      const span = document.createElement('span')
      spans.push(span)
      span.style.top = `${ i * 2 }px`
      btn.appendChild(span)

      const randomDelay = ( Math.random() * 0.75) + 0
      span.style.transitionDelay = `${ randomDelay }s`
    }
  })
})