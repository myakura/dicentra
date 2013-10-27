(function () {
    var msgText = document.querySelector('dd.message p').textContent,
        reURLs = /https?:\/\/bugs\.webkit\.org\/show_bug\.cgi\?id=\d+|<\s*(?:https?:\/\/webkit\.org\/b|rdar:\/\/problem)\/\d+>/g;

        /*
        bugzilla : /https?:\/\/bugs\.webkit\.org\/show_bug\.cgi\?id=\d+/g,
        shortened: /<\s*https?:\/webkit\.org\/b\/\d+>/g;
        rdar url : /<\s*rdar:\/\/problem\/\d+>/g,
        // might need ones for wkb.ug and wkbug.com someday.
        */

    // remove wk bug and rdar urls, then trim.
    msgText = msgText.replace(reURLs, '').trim();

    // if there are multiple "paragraphs" in the element, grab the first one
    if (/\n\s*\n/.test(msgText)) {
        msgText = msgText.split(/\n\s*\n/)[0];
    }

    document.title += ' ― ' + msgText.replace(/\n/,' ');
}());

