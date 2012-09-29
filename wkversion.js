(function () {

    /**
     * Helper function for XHR
     * @param {string} url a URL to GET
     * @param {function(string, Object=)} callback invoked when a request succeeds
     * @param {Object=} annexure data which can be passed to the {@code callback}
     */
    var request = function (url, callback, annexure) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                callback(xhr.response, annexure);
            } else {
                console.error('Request failed.');
            }
        }
        xhr.send();
    };

    /**
     * Obtains WebKit revision number from changeset URL.
     * @param {string} url URL of a WebKit changeset.
     * @return {number} revision a WebKit revision number
     */
    var getWebKitRevision = function (url) {

        var regChangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)$/;

        if (regChangeset.test(url)) {
            return parseInt(regChangeset.exec(url).slice(1), 10);
        } else {
            console.error('Invalid argument: ', url);
            return;
        }
    };

    /**
     * Obtains WebKit version number from revision number.
     * @param {(number|string)} revision revision number of a WebKit changeset.
     * @return {Array.<string>} an array of strings made by MAJOR_VERSION and MINOR_VERSION
     */
    var getWebKitVersion = function (revision) {

        var rev = parseInt(revision, 10);

        if (rev < 20261) {
            console.error('There was no conf file before r20261.');
            return;
        }

        var url = 'http://trac.webkit.org/export/' + rev +
                  (rev >= 75314 ? '/trunk/Source' : '/trunk') +
                  '/WebCore/Configurations/Version.xcconfig';

        var extractWKVersion = function (response) {
            var data = response,
                regVersions = /MAJOR_VERSION = (\d{3});\nMINOR_VERSION = (\d{1,2});/;

            if (regVersions.test(data)) {
                var version = regVersions.exec(data).slice(1).join('.');
                var ev = new CustomEvent('WKVersionObtained', { "detail": { "version": version }});
                window.dispatchEvent(ev);
            } else {
                console.error('Cannot obtain version from the data.');
            }
        };

        request(url, extractWKVersion);
    };

    /**
     * Canonicalizes the version string by zero-padding for making it easier in comparison.
     * @param {(Array.<string>|string)} version WebKit version string
     * @return {string} canonicalized version string (zero-padded)
     */
    var canonicalizeWebKitVersion = function (version) {

        if (Array.isArray(version) && version.length >= 2) {
            version = version.join('.');
        }

        var regVersion = /^(\d{3})\.(\d{1,2})\.?\d*$/;
        if (typeof version === 'string' && regVersion.test(version)) {
            return version.replace(regVersion, function(m, p1, p2) {
                return p1 + '.' + (p2.length === 2 ? p2 : '0' + p2);
            });
        } else {
            console.error('Invalid argument: ', version);
            return;
        }
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

        version = canonicalizeWebKitVersion(version);

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
            /* TODO: find a way to distinguish Cr13 and Cr14
            { "product": "14", "branch": "835",  "webkit": "535.1" },
            { "product": "13", "branch": "782",  "webkit": "535.1" },
            */

        return findBrowserVersion(chrome, version);
    };

    /**
     * Adds corresponding WebKit version to the changeset heading.
     * @param {string} version WebKit version string
     */
    var updateChangesetHeading = function (version) {
        var safariVersion = findSafariVersion(version);
        var chromeVersion = findChromeVersion(version);
        document.querySelector('h1').textContent +=
            ' (' + version + ' | Safari ' + safariVersion + ' | Chrome ' + chromeVersion + ')';
    };


    /* init */
    var url = location.href,
        rev = getWebKitRevision(url);

    window.addEventListener('WKVersionObtained', function (e) {
        var version = e.detail.version;
        updateChangesetHeading(version);
    });

    getWebKitVersion(rev);

}());
