(function () {

    /**
     * Obtains WebKit revision number from the changeset URL.
     * @param {string} url Mandatory URL of a WebKit changeset.
     * @return {number} revision number
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
     * Obtains WebKit version number from the revision number.
     * @param {number} revision Mandatory revision number of a WebKit changeset.
     * @return {Array.<string>} an array of strings made by MAJOR_VERSION and MINOR_VERSION
     */
    var getWebKitVersion = function (revision) {

        if (revision < 20261) {
            console.error('There was no conf file before r20261.');
            return;
        }

        var url = 'http://trac.webkit.org/export/' + revision +
                  (revision >= 75314 ? '/trunk/Source' : '/trunk') +
                  '/WebCore/Configurations/Version.xcconfig';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onload = function () {
            if (xhr.status === 200) {
                var data = xhr.response,
                    regVersions = /MAJOR_VERSION = (\d{3});\nMINOR_VERSION = (\d{1,2});/;
                if (regVersions.test(data)) {
                    var version = regVersions.exec(data).slice(1).join('.');
                    var ev = new CustomEvent('WKVersionObtained', { "detail": { "version": version }});
                    window.dispatchEvent(ev);
                } else {
                    console.error('Cannot obtain version from file.');
                    return;
                }
            } else {
                console.error('Something gone wrong during request.');
                return;
            }
        };

        xhr.send();
    };

    /**
     * Canonicalizes the version string by zero-padding for making it easier in comparison.
     * @param {(Array.<string>|string)} version WebKit version string
     * @return {string} canonicalized version string; zero-pads if necessary
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
     * @param {browser} browser an array contains objects of product and webkit version numbers
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
            { "product": "5.1", "webkit": "534.55.3" },
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
            { "product": "20", "branch": "1123", "webkit": "536.10" },
            { "product": "19", "branch": "1084", "webkit": "536.5" },
            { "product": "18", "branch": "1025", "webkit": "535.19" },
            { "product": "17", "branch": "963",  "webkit": "535.11" },
            { "product": "16", "branch": "912",  "webkit": "535.7" },
            { "product": "15", "branch": "874",  "webkit": "535.2" },
            { "product": "13/14", "branch": "835",  "webkit": "535.1" },
            /* TODO: find a way to differentiate Cr13 and Cr14
            { "product": "14", "branch": "835",  "webkit": "535.1" },
            { "product": "13", "branch": "782",  "webkit": "535.1" },
            */
            { "product": "12", "branch": "742",  "webkit": "534.30" },
            { "product": "11", "branch": "696",  "webkit": "534.24" },
            { "product": "10", "branch": "648",  "webkit": "534.16" },
            { "product": "9",  "branch": "597",  "webkit": "534.13" },
            { "product": "8",  "branch": "552",  "webkit": "534.10" },
            { "product": "7",  "branch": "517",  "webkit": "534.7" },
            { "product": "6",  "branch": "472",  "webkit": "534.3" },
            { "product": "5",  "branch": "375",  "webkit": "533.4" },
            { "product": "4",  "branch": "249",  "webkit": "532.5" },
            { "product": "3",  "branch": "195",  "webkit": "532.0" },
            { "product": "2",  "branch": "172",  "webkit": "530.5" },
            { "product": "1",  "branch": "154",  "webkit": "525.19" },
        ];

        return findBrowserVersion(chrome, version);
    };

    /**
     * Adds corresponding WebKit version to the changeset heading.
     * @param {string} version WebKit version string
     */
    var updateChangesetHeading = function (version) {
        var safariVersion = findSafariVersion(version);
        var chromeVersion = findChromeVersion(version);
        document.querySelector('h1').textContent += ' (' + version + ' | Safari ' + safariVersion + ' | Chrome ' + chromeVersion + ')';
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
