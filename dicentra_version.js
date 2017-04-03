'use strict'

/**
 * Get URL of Version.xcconfig at a given revision
 * @param {string} url URL of the changeset
 * @return {string} url URL of Version.xcconfig at a given revision
 */
const getConfigURL = url => {
  const reChangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)\/?\w+$/
  if (reChangeset.test(url)) {
    const revision = parseInt(reChangeset.exec(url).slice(1))
    // there wasn't Version.xcconfig before r20261
    if (revision >= 20261) {
      // path change happend at r75314
      const path = (revision >= 75314) ? '/trunk/Source' : '/trunk'
      return `${location.protocol}//trac.webkit.org/export/${revision}${path}/WebCore/Configurations/Version.xcconfig`
    }
    else {
      throw new Error('No Version.xcconfig before r20261.')
    }
  }
  else {
    throw new Error('Invalid Changeset URL.')
  }
}

/**
 * Get WebKit version string from Version.xcconfig
 * @param {string} response HTTP response from Version.xcconfig (in plain text)
 */
const getWebKitVersion = response => {
  const reVersions = /MAJOR_VERSION = (\d{3});\nMINOR_VERSION = (\d{1,2});/
  if (reVersions.test(response)) {
    const [_, major, minor] = reVersions.exec(response)
    return `${major}.${minor.padStart(2, '0')}`
  }
  else {
    throw new Error('Cannot obtain version from the response.')
  }
}

/**
 * Returns the earliest version of a browser that (might) support the feature on the changeset
 * @param {Array.<Object>} browser an array contains objects of product and webkit version numbers
 * @param {string} version WebKit version string
 * @return {string} a browser version number
 */
const findBrowserVersion = (browser, version) => {
  let i = 0
  let l = browser.length
  let candidate = 0
  if (version > browser[0].webkit) {
    return 'Nightly'
  }
  else if (version < browser[l-1].webkit) {
    return ''
  }
  else {
    while (i < l) {
      if (version <= browser[i].webkit) {
        candidate = i
      }
      else {
        return browser[candidate].product
      }
      i++
    }
  }
}

/**
 * Returns the earliest Safari version that (might) support the feature on the changeset
 * @param {string} version canonicalized version string
 * @return {string} Safari version number
 */
const findSafariVersion = version => {
  const safari = [
    { "product": "10.1", "webkit": "603.1.30" },
    { "product": "10.0", "webkit": "602.1.50" },
    { "product": "9.1", "webkit": "601.05.17" },
    { "product": "9.0", "webkit": "601.01" },
    { "product": "8.0", "webkit": "600.01" },
    { "product": "7.0", "webkit": "537.71" },
    { "product": "6.0", "webkit": "536.25" },
    { "product": "5.1", "webkit": "534.48.3" },
    { "product": "5.0", "webkit": "534.22.3" },
    { "product": "4.1", "webkit": "533.19.4" },
    { "product": "4.0", "webkit": "531.22.7" },
    { "product": "3.2", "webkit": "525.28" },
    { "product": "3.1", "webkit": "525.21" },
    { "product": "3.0", "webkit": "523.10" }
  ]
  return findBrowserVersion(safari, version)
}

/**
 * Returns the earliest Chrome version that (might) support the feature on the changeset
 * @param {string} version canonicalized version string
 * @return {string} Chrome version number
 */
const findChromeVersion = version => {
  const chrome = [
    { "product": "27",    "webkit": "537.36" },
    { "product": "26",    "webkit": "537.31" },
    { "product": "25",    "webkit": "537.22" },
    { "product": "24",    "webkit": "537.17" },
    { "product": "23",    "webkit": "537.11" },
    { "product": "22",    "webkit": "537.04" },
    { "product": "21",    "webkit": "537.01" },
    { "product": "20",    "webkit": "536.11" },
    { "product": "19",    "webkit": "536.05" },
    { "product": "18",    "webkit": "535.19" },
    { "product": "17",    "webkit": "535.11" },
    { "product": "16",    "webkit": "535.07" },
    { "product": "15",    "webkit": "535.02" },
    { "product": "13/14", "webkit": "535.01" },
    { "product": "12",    "webkit": "534.30" },
    { "product": "11",    "webkit": "534.24" },
    { "product": "10",    "webkit": "534.16" },
    { "product": "9",     "webkit": "534.13" },
    { "product": "8",     "webkit": "534.10" },
    { "product": "7",     "webkit": "534.07" },
    { "product": "6",     "webkit": "534.03" },
    { "product": "5",     "webkit": "533.04" },
    { "product": "4",     "webkit": "532.05" },
    { "product": "3",     "webkit": "532.00" },
    { "product": "2",     "webkit": "530.05" },
    { "product": "1",     "webkit": "525.19" },
  ]
  return findBrowserVersion(chrome, version)
}

/**
 * Update the heading of the changest
 * @param {string} version WebKit version string
 */
const updatePage = version => {
  const safariVersion = findSafariVersion(version)
  const chromeVersion = findChromeVersion(version)
  let versionStrings = [
    `WebKit ${version}`,
    `Safari ${safariVersion}`
  ]
  if (chromeVersion !== 'Nightly') {
    versionStrings.push(`Chrome ${chromeVersion}`)
  }
  document.querySelector('h1').textContent += ` (${versionStrings.join(' | ')})`
}

// kick off
fetch(getConfigURL(location.href))
.then(response => {
  if (response.ok) {
    return response.text()
  }
  else {
    return Promise.reject(new Error(`${response.status}: ${response.statusText}`))
  }
})
.then(getWebKitVersion)
.then(updatePage)
.catch(e => console.error(e))
