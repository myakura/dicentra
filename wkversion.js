(function () {

    var getWebKitRevision = function (url) {
        var regChangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)$/;
        if (regChangeset.test(url)) {
            return parseInt(regChangeset.exec(url).slice(1), 10);
        } else {
            console.error('Invalid argument: ', url);
        }
    };

    var getWebKitVersion = function (revision) {

        if (revision < 25325) {
            console.error('There was no conf file before r25325.');
            return;
        }

        var url = 'http://trac.webkit.org/export/' + revision +
                  (revision >= 75314 ? '/trunk/Source' : '/trunk') +
                  '/WebCore/Configurations/Version.xcconfig';

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onload = function () {
            if (xhr.status === 200) {
                var data = xhr.response;
                var regVersions = /MAJOR_VERSION = (\d+);\nMINOR_VERSION = (\d+);/;
                if (regVersions.test(data)) {
                    var version = regVersions.exec(data).slice(1);
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

    var updateChangesetHeading = function (versionArray) {
        if (Array.isArray(versionArray) && versionArray.length === 2) {
            document.querySelector('h1').textContent += ' (' + versionArray.join('.') + ')';
        } else {
            console.error('Invalid argument: ', versionArray);
        }
    };

    var url = location.href,
        rev = getWebKitRevision(url);

    window.addEventListener('WKVersionObtained', function (e) {
        var version = e.detail.version;
        updateChangesetHeading(version);
    });

    getWebKitVersion(rev);

}());
