(function () {
    var msgelem = document.querySelector('dd.message p'),
        msgtext = msgelem.textContent,
        reurls = /https?:\/\/bugs\.webkit\.org\/show_bug\.cgi\?id=\d+|<\s*(?:https?:\/\/webkit\.org\/b|rdar:\/\/problem)\/\d+>/g;

        /*
        bugzilla : /https?:\/\/bugs\.webkit\.org\/show_bug\.cgi\?id=\d+/g,
        shortered: /<\s*https?:\/webkit\.org\/b\/\d+>/g;
        rdar url : /<\s*rdar:\/\/problem\/\d+>/g,
        // might need ones for wkb.ug and wkbug.com someday.
        */

    // remove wk bug and rdar urls, then trim.
    msgtext = msgtext.replace(reurls, '').trim();

    // if there are multiple "paragraphs" in the element, grab the first one
    if (/\s+\n/.test(msgtext)) {
        msgtext = msgtext.split(/\s+\n/)[0];
    }

    document.title += ' ― ' + msgtext.replace(/\n/,' ');
}());

