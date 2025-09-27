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

    // 3. GitHub APIからMarkdownファイル一覧を取得
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
                const markdownFiles = data.filter(item => item.type === "file" && item.name.endsWith('.md') && !item.name.startsWith('.'));
                
                if (markdownFiles.length === 0) {
                    projectListContainer.innerHTML = "<p>まだ記事がありません。</p>";
                    return;
                }

                markdownFiles.forEach(item => {
                    const fileName = item.name;
                    const baseName = fileName.replace('.md', '');
                    const card = document.createElement("a");
                    card.href = `./${fileName}`;
                    card.className = "project-card";
                    card.innerHTML = `<h3>${baseName}</h3>`; 
                    projectListContainer.appendChild(card);
                    
                    const markdownUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${fileName}`;
                    fetch(markdownUrl)
                        .then(res => res.text())
                        .then(markdown => {
                            // Markdownファイルからタイトルを抽出（# で始まる最初の行）
                            const titleMatch = markdown.match(/^#\s+(.+)$/m);
                            const title = titleMatch ? titleMatch[1].trim() : baseName;
                            card.querySelector("h3").textContent = title;
                        })
                        .catch(() => {
                            console.warn(`Could not fetch title for: ${fileName}`);
                        });
                });
            })
            .catch(error => {
                projectListContainer.innerHTML = "<p>記事一覧の読み込みに失敗しました。</p>";
                console.error("Error fetching repository contents:", error);
            });
    }
});
