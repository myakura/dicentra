(function () {

    var MyError = function (message) {
        this.message = message;
    }
    MyError.prototype = new Error();
    
    var InvalidArgumentError = function (argument) {
        this.message = 'Invalid argument(s) passed: ' + argument;
    }
    InvalidArgumentError.prototype = new Error();

    var getWKRevision = function (url) {
        var regChangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)$/;
        if (regChangeset.test(url)) {
            return parseInt(regChangeset.exec(url).slice(1), 10);
        } else {
            throw new InvalidArgumentError(url);
        }
    }

    var getWKConfFilePath = function (revision) {
        if (revision < 25325) {
            throw new MyError('There was no conf file before r25325.');
        }

        return 'http://trac.webkit.org/export/' + revision +
               (revision >= 75314 ? '/trunk/Source' : '/trunk') +
               '/WebCore/Configurations/Version.xcconfig';
    }

    var getWKConfFile = function (url) {
        if (!/\/WebCore\/Configurations\/Version\.xcconfig$/.test(url)) {
            throw new InvalidArgumentError(url);
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
            if (xhr.status === 200) {
                var event = new CustomEvent('WKConfFileLoaded', { "detail": { "response": xhr.response } });
                window.dispatchEvent(event);
            } else {
                throw new MyError('Something wrong happened during request.')
            }
        }
        xhr.send();
    }

    var getWKVersion = function (data) {
        var regVersions = /MAJOR_VERSION = (\d+);\nMINOR_VERSION = (\d+);/;
        if (regVersions.test(data)) {
            var version = regVersions.exec(data).slice(1);
            var event = new CustomEvent('WKVersionObtained', { "detail": { "version": version }});
            window.dispatchEvent(event);
        } else {
            throw new InvalidArgumentError(data);
        }
    }

    var updateChangesetHeading = function (versionArray) {
        if (Array.isArray(versionArray) && versionArray.length === 2) {
            document.querySelector('h1').textContent += ' (' + versionArray.join('.') + ')';
        } else {
            throw new InvalidArgumentError(versionArray);
        }
    }

    var url = location.href;
    var rev = getWKRevision(url);
    var path = getWKConfFilePath(rev);
    window.addEventListener('WKConfFileLoaded', function (e) {
        getWKVersion(e.detail.response);
    });
    window.addEventListener('WKVersionObtained', function (e) {
        var version = e.detail.version;
        updateChangesetHeading(version);
    });
    getWKConfFile(path);

}());
