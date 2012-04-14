Dicentra
========

[WebKitのChangeset](http://trac.webkit.org/timeline)を見ていると

* タイトルもうちょっとなんとかしてほしい
* これどのバージョンに入るんだろう

なんて思うことがよくある。

というわけで、タイトルを読みやすくしたり、Changesetが反映される(された)であろうバージョンを表示するChrome拡張をつくろう。

メモ: Safari/Chromeのバージョン
-------------------------

Feature flagsがあるので、必ずしもその機能が該当するバージョンに入るわけではないけれど、SafariとChromeのバージョンもどこかに表示させときたい。

0. がんばってこれまでリリースされたバージョンのUA Stringをあつめる
1. UA StringからWebKitのバージョン部分を取り出す
2. Changesetに該当するWebKitのバージョンと比較

0をなんとかしないと。めんどくさいなあ……

Safariについてはそんな数もないし、なんとかなるか。Chromeはソースコード探るようにすれば自動的にできるかな……

