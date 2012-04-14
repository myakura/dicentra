(function () {
    var url = location.href,
        rechangeset = /^https?:\/\/trac\.webkit\.org\/changeset\/(\d+)$/;

    if (!rechangeset.test(url)) return;
    var revision = url.match(rechangeset)[1];

    // path to Version.xcconfig
    var pathtoconf = 'http://trac.webkit.org/export/' + revision + '/trunk/' +
                   (revision >= 75314 ? 'Source/' : '') +
                   'WebCore/Configurations/Version.xcconfig';

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        showVersion(xhr.response);
    };
    xhr.open('GET', pathtoconf);
    xhr.send();

    function showVersion(res) {
        var revers = /MAJOR_VERSION = (\d+);\nMINOR_VERSION = (\d+);/;

        if (!revers.test(res)) return;
        var version = res.match(revers).slice(1);

        document.querySelector('h1').textContent += ' (' + version.join('.') + ')';
    }
}());

