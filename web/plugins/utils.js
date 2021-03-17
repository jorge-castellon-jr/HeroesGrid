const friendlyURL = (text) => {
  return text.toLowerCase().replace(' ', '-')
}

const dashToSpace = (text) => {
  return text
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

export default (context, inject) => {
  inject('friendlyURL', friendlyURL)
  inject('dashToSpace', dashToSpace)
}
