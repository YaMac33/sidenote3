document.addEventListener("DOMContentLoaded", function () {

    // 1. ヘッダーを読み込んで表示
    fetch('header.html')
        .then(response => {
            if (!response.ok) throw new Error('Header not found');
            return response.text();
        })
        .then(data => {
            document.body.insertAdjacentHTML('afterbegin', data);
        })
        .catch(error => {
            console.error('Error fetching header:', error);
            const fallbackHeader = `
                <header class="site-header">
                    <div class="header-container"><a href="./" class="logo">SideNote</a></div>
                </header>`;
            document.body.insertAdjacentHTML('afterbegin', fallbackHeader);
        });

    // 2. フッターを読み込んで表示
    fetch('footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Footer not found');
            return response.text();
        })
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);
        })
        .catch(error => {
            console.error('Error fetching footer:', error);
            const fallbackFooter = `
                <footer class="site-footer-container">
                    <div class="footer-content"><p>© 2025 YaMac33</p></div>
                </footer>`;
            document.body.insertAdjacentHTML('beforeend', fallbackFooter);
        });

    // 3. GitHub APIから記事一覧を取得
    const username = "YaMac33";
    const repoName = "sidenote3";
    const projectListContainer = document.getElementById("project-list-container");

    if (projectListContainer) {
        projectListContainer.innerHTML = '<div class="loader"></div>';

        fetch(`https://api.github.com/repos/${username}/${repoName}/contents/`)
            .then(response => response.json())
            .then(data => {
                projectListContainer.innerHTML = "";
                data.reverse();
                const visibleDirs = data.filter(item => item.type === "dir" && !item.name.startsWith('.'));

                if (visibleDirs.length === 0) {
                    projectListContainer.innerHTML = "<p>まだ記事がありません。</p>";
                    return;
                }

                visibleDirs.forEach(item => {
                    const dirName = item.name;
                    const card = document.createElement("a");
                    card.className = "project-card";
                    card.innerHTML = `<h3>${dirName}</h3>`; // 初期表示はディレクトリ名
                    projectListContainer.appendChild(card);

                    // まずindex.htmlの取得を試みる
                    const indexHtmlUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${dirName}/index.html`;
                    fetch(indexHtmlUrl)
                        .then(res => {
                            if (!res.ok) throw new Error('index.html not found');
                            return res.text();
                        })
                        .then(html => {
                            // index.htmlが見つかった場合
                            card.href = `./${dirName}/`; // リンク先はディレクトリ
                            const match = html.match(/<title>(.*?)<\/title>/i);
                            const title = match ? match[1] : dirName;
                            card.querySelector("h3").textContent = title;
                        })
                        .catch(() => {
                            // index.htmlが見つからなかった場合、index.mdの取得を試みる
                            const indexMdUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${dirName}/index.md`;
                            fetch(indexMdUrl)
                                .then(res => {
                                    if (!res.ok) throw new Error('index.md not found');
                                    return res.text();
                                })
                                .then(markdown => {
                                    // index.mdが見つかった場合
                                    card.href = `./${dirName}/index.md`; // リンク先は.mdファイル
                                    const match = markdown.match(/^#\s+(.*)/m); // 最初のH1見出し(#)をタイトルとして抽出
                                    const title = match ? match[1] : dirName;
                                    card.querySelector("h3").textContent = title;
                                })
                                .catch(() => {
                                    // どちらのファイルも見つからなかった場合
                                    card.href = `./${dirName}/`; // とりあえずディレクトリにリンク
                                    console.warn(`Could not find index.html or index.md in: ${dirName}`);
                                });
                        });
                });
            })
            .catch(error => {
                projectListContainer.innerHTML = "<p>記事一覧の読み込みに失敗しました。</p>";
                console.error("Error fetching repository contents:", error);
            });
    }
});
