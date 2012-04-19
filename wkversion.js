(function () {
    var url = location.href,
        reChangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)$/;

    if (!reChangeset.test(url)) return;
    var revision = parseInt(url.match(reChangeset)[1], 10);

    // looks like r25325 is the oldest revision
    if (revision < 25325) return;

    // path to Version.xcconfig
    var pathFile = 'http://trac.webkit.org/export/' + revision + '/trunk/' +
                   (revision >= 75314 ? 'Source/' : '') +
                   'WebCore/Configurations/Version.xcconfig';

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        showVersion(xhr.response);
    };
    xhr.open('GET', pathFile);
    xhr.send();

    function showVersion(response) {
        var reVersions = /MAJOR_VERSION = (\d+);\nMINOR_VERSION = (\d+);/;

        if (!reVersions.test(response)) return;
        var version = response.match(reVersions).slice(1);

        document.querySelector('h1').textContent += ' (' + version.join('.') + ')';
    }

}());

