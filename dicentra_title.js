(function () {
  var message = document.querySelector('dd.message p').textContent
  var re = /https?:\/\/bugs\.webkit\.org\/show_bug\.cgi\?id=\d+|<\s*(?:https?:\/\/webkit\.org\/b|rdar:\/\/problem)\/\d+>/g
  /*
  bugzilla:  /https?:\/\/bugs\.webkit\.org\/show_bug\.cgi\?id=\d+/g
  shortened: /<\s*https?:\/webkit\.org\/b\/\d+>/g
  radar url: /<\s*rdar:\/\/problem\/\d+>/g
  */

  message = message.replace(re, '').trim()

  // if there are multiple "paragraphs" in the element, grab the first one
  if (/\n\s*\n/.test(message)) {
    message = message.split(/\n\s*\n/)[0]
  }
  document.title += ' \u2014 ' + message.replace(/\n/, ' ')
}())

