Dicentra
========

WebKitのChangesetを見ていると

* タイトルもうちょっとなんとかしてほしい
* これどのバージョンに入るんだろう

なんて思うことがよくある。

というわけで、タイトルを読みやすくしたり、Changesetが反映される(された)であろうバージョンを表示するChrome拡張。

タイトル
--------

"Changeset nnnnnn - WebKit" だけだと何が書いてあるのかわからない。せっかく細かいコミットメッセージがあるので、概要を取ってきてそれをタイトルに含めてやる。

1. コミットメッセージの最初の`&lt;p>`を取得（`dd.message > p:first-child`）
2. WebKit BugのURLより前のテキストを取得（`innerHTML`からregexでとる？）
3. `document.title`とがっちゃんこ

ときどきバグのURLが先行していたりするものもあるけれど、それはいいか。

WebKitのバージョン
------------------

1. WebKitのChangesetからrevisionをとりだす
2. [Version.xcconfig](http://trac.webkit.org/browser/trunk/Source/WebCore/Configurations/Version.xcconfig) の該当revを取得
3. MAJOR_VERSION と MINOR_VERSION をがっちゃんこ

### Version.xcconfigの場所

そういえばディレクトリの再構成があったんだった。

[r75314](http://trac.webkit.org/changeset/75314)で移動してるので、それより前は`trunk/WebCore/Configurations/Version.xcconfig`を見ないといけない（今は`trunk/Source/WebCore/Configurations/`にある）。

Safari/Chromeのバージョン
-------------------------

Feature flagsがあるので、必ずしもその機能が該当するバージョンに入るわけではないけれど、SafariとChromeのバージョンもどこかに表示させときたい。

0. がんばってこれまでリリースされたバージョンのUA Stringをあつめる
1. UA StringからWebKitのバージョン部分を取り出す
2. Changesetに該当するWebKitのバージョンと比較

0をなんとかしないと。めんどくさいなあ……

