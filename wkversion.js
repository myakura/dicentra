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
     * Adds corresponding WebKit version to the changeset heading.
     * @param {string} version WebKit version string
     */
    var updateChangesetHeading = function (version) {
        document.querySelector('h1').textContent += ' (' + version + ')';
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
