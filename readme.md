Dicentra
========

[WebKitのChangeset](http://trac.webkit.org/timeline)を見ていると

* タイトルもうちょっとなんとかしてほしい
* これどのバージョンに入るんだろう

なんて思うことがよくある。

というわけで、タイトルを読みやすくしたり、Changesetが反映される(された)であろうバージョンを表示するChrome拡張をつくろう。

メモ: WebKitのバージョン
------------------

1. WebKitのChangesetからrevisionをとりだす
2. [Version.xcconfig](http://trac.webkit.org/browser/trunk/Source/WebCore/Configurations/Version.xcconfig) の該当revを取得
3. MAJOR_VERSION と MINOR_VERSION をがっちゃんこ

### Version.xcconfigの場所

そういえばディレクトリの構成が変わっていたんだった。

[r75314](http://trac.webkit.org/changeset/75314)で移動してるので、それより前は`trunk/WebCore/Configurations/`を見ないといけない（今は`trunk/Source/WebCore/Configurations/`にある）。

メモ: Safari/Chromeのバージョン
-------------------------

Feature flagsがあるので、必ずしもその機能が該当するバージョンに入るわけではないけれど、SafariとChromeのバージョンもどこかに表示させときたい。

0. がんばってこれまでリリースされたバージョンのUA Stringをあつめる
1. UA StringからWebKitのバージョン部分を取り出す
2. Changesetに該当するWebKitのバージョンと比較

0をなんとかしないと。めんどくさいなあ……

Safariについてはそんな数もないし、なんとかなるか。Chromeはソースコード探るようにすれば自動的にできるかな……

