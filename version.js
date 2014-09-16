(function () {

  /**
   * Helper function of XHR
   * @param {string} url URL to which make an HTTP request
   */
  var httpget = function (url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(xhr.response);
        }
        else {
          reject(new Error(xhr.status));
        }
      };
      xhr.onerror = function () {
        reject(new Error(xhr.status));
      };
      xhr.send();
    });
  };

  /**
   * Get WebKit version string from an HTTP response
   * @param {string} url URL of the changeset
   * @return {string} url for Version.xcconfig at a given revision
   */
  var getConfigURL = function (url) {
    var reChangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)$/;
    if (reChangeset.test(url)) {
      var revision = parseInt(reChangeset.exec(url).slice(1));
      if (revision >= 20261) {
        return location.protocol + '//trac.webkit.org/export/' + revision +
               (revision >= 75314 ? '/trunk/Source' : '/trunk') +
               '/WebCore/Configurations/Version.xcconfig';
      }
      else {
        return new Error('No Version.xcconfig before r20261.');
      }
    }
    else {
      return new Error('Invalid URL.');
    }
  };

  /**
   * Get WebKit version string from an HTTP response
   * @param {string} response HTTP response from Version.xcconfig
   */
  var getWebKitVersion = function (response) {
    return new Promise(function (resolve, reject) {
      var reVersions = /MAJOR_VERSION = (\d{3});\nMINOR_VERSION = (\d{1,2});/;
      if (reVersions.test(response)) {
        var version = reVersions.exec(response).slice(1).join('.')
          .replace(/(\d{3})\.(\d{1,2})/, function(m, p1, p2) {
            return p1 + '.' + ('0' + p2).slice(-2);
          });
        resolve(version);
      } else {
        reject(new Error('Cannot obtain version from the response.'));
      }
    });
  };

  /**
   * Update the heading of the changest
   * @param {string} version WebKit version string
   */
  var updatePage = function (version) {
    var safariVersion = findSafariVersion(version);
    var chromeVersion = findChromeVersion(version);
    document.querySelector('h1').textContent += ' (' + version + ' | Safari ' + safariVersion + ((chromeVersion !== 'Nightly') ? ' | Chrome ' + chromeVersion : '') + ')';
  };

  /**
   * Returns the earliest version of a browser that (might) support the feature on the changeset
   * @param {Array.<Object>} browser an array contains objects of product and webkit version numbers
   * @param {string} version WebKit version string
   * @return {string} a browser version number
   */
  var findBrowserVersion = function (browser, version) {
    if (!Array.isArray(browser) || browser.length === 0) {
      console.error('Invalid argument: ', browser);
      return;
    }
    if (!('product' in browser[0]) || !('webkit' in browser[0])) {
      console.error('Invalid argument: ', browser[0]);
      return;
    }
    var i = 0,
        l = browser.length,
        candidate;
    if (version > browser[0].webkit) { return 'Nightly'; }
    if (version < browser[l-1].webkit) { return ''; }
    while (i < l) {
      if (version <= browser[i].webkit) {
        candidate = i;
      } else {
        return browser[candidate].product;
      }
      i++;
    }
  };

  /**
   * Returns the earliest Safari version that (might) support the feature on the changeset
   * @param {string} version canonicalized version string
   * @return {string} Safari version number
   */
  var findSafariVersion = function (version) {
    var safari = [
      { "product": "7.0", "webkit": "537.71" },
      { "product": "6.0", "webkit": "536.25" },
      { "product": "5.1", "webkit": "534.48.3" },
      { "product": "5.0", "webkit": "534.22.3" },
      { "product": "4.1", "webkit": "533.19.4" },
      { "product": "4.0", "webkit": "531.22.7" },
      { "product": "3.2", "webkit": "525.28" },
      { "product": "3.1", "webkit": "525.21" },
      { "product": "3.0", "webkit": "523.10" }
    ];
    return findBrowserVersion(safari, version);
  };

  /**
   * Returns the earliest Chrome version that (might) support the feature on the changeset
   * @param {string} version canonicalized version string
   * @return {string} Chrome version number
   */
  var findChromeVersion = function (version) {
    var chrome = [
      { "product": "27", "branch": "1453", "webkit": "537.36" },
      { "product": "26", "branch": "1410", "webkit": "537.31" },
      { "product": "25", "branch": "1364", "webkit": "537.22" },
      { "product": "24", "branch": "1312", "webkit": "537.17" },
      { "product": "23", "branch": "1271", "webkit": "537.11" },
      { "product": "22", "branch": "1229", "webkit": "537.04" },
      { "product": "21", "branch": "1180", "webkit": "537.01" },
      { "product": "20", "branch": "1132", "webkit": "536.11" },
      { "product": "19", "branch": "1084", "webkit": "536.05" },
      { "product": "18", "branch": "1025", "webkit": "535.19" },
      { "product": "17", "branch": "963",  "webkit": "535.11" },
      { "product": "16", "branch": "912",  "webkit": "535.07" },
      { "product": "15", "branch": "874",  "webkit": "535.02" },
      { "product": "13/14", "branch": "835",  "webkit": "535.01" },
      { "product": "12", "branch": "742",  "webkit": "534.30" },
      { "product": "11", "branch": "696",  "webkit": "534.24" },
      { "product": "10", "branch": "648",  "webkit": "534.16" },
      { "product": "9",  "branch": "597",  "webkit": "534.13" },
      { "product": "8",  "branch": "552",  "webkit": "534.10" },
      { "product": "7",  "branch": "517",  "webkit": "534.07" },
      { "product": "6",  "branch": "472",  "webkit": "534.03" },
      { "product": "5",  "branch": "375",  "webkit": "533.04" },
      { "product": "4",  "branch": "249",  "webkit": "532.05" },
      { "product": "3",  "branch": "195",  "webkit": "532.00" },
      { "product": "2",  "branch": "172",  "webkit": "530.05" },
      { "product": "1",  "branch": "154",  "webkit": "525.19" },
    ];
      /* ISSUE: no way to distinguish Cr13 and Cr14
      { "product": "14", "branch": "835",  "webkit": "535.1" },
      { "product": "13", "branch": "782",  "webkit": "535.1" },
      */
    return findBrowserVersion(chrome, version);
  };

  // kick off
  (function () {
    httpget(getConfigURL(location.href))
      .then(getWebKitVersion)
      .then(updatePage)
      .catch(console.error)
  }());

}());
