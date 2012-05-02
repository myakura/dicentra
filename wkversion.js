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
     * @param {(Array.<string>|string)} version WebKit Version string
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
     * Returns the Safari version number in which feature might be available with the associated WebKit Version
     * @param {string} version canonicalized version string
     * @return {string} the Safari version number in which feature might be available with the associated WebKit Version
     */
    var findSafariVersion = function (version) {
        var safari = [
            { "product": "5.1", "webkit" : "534.55.3" },
            { "product": "5.0", "webkit" : "534.22.3" },
            { "product": "4.1", "webkit" : "533.19.4" },
            { "product": "4.0", "webkit" : "531.22.7" },
            { "product": "3.2", "webkit" : "525.28" },
            { "product": "3.1", "webkit" : "525.21" },
            { "product": "3.0", "webkit" : "523.10" },
        ];
        var i = 0,
            l = safari.length,
            candidate;

        if (version > safari[0].webkit) { return 'Nightly'; }
        if (version < safari[l-1].webkit) { return ''; }

        while (i < l) {
            if (version <= safari[i].webkit) {
                candidate = i;
            } else {
                return safari[candidate].product;
            }
            i++;
        }
    };

    /**
     * Adds corresponding WebKit version to the changeset heading.
     * @param {string} version WebKit version string
     */
    var updateChangesetHeading = function (version) {
        var canoVersion = canonicalizeWebKitVersion(version);
        var safariVersion = findSafariVersion(canoVersion);
        document.querySelector('h1').textContent += ' (' + version + ' / Safari ' + safariVersion + ')';
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
