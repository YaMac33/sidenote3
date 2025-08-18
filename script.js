document.addEventListener("DOMContentLoaded", function () {
    
    // 1. ヘッダーを読み込んで表示
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Header not found');
            }
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

    // 2. GitHub APIから記事一覧を取得
    const username = "YaMac33";
    const repoName = "SideNote";
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
                    card.href = `./${dirName}/`;
                    card.className = "project-card";
                    card.innerHTML = `<h3>${dirName}</h3>`; // Use dirName as initial title
                    projectListContainer.appendChild(card);

                    // Fetch the actual title from the index.html of each directory
                    const indexUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/${dirName}/index.html`;
                    fetch(indexUrl)
                        .then(res => res.text())
                        .then(html => {
                            const match = html.match(/<title>(.*?)<\/title>/i);
                            const title = match ? match[1] : dirName;
                            card.querySelector("h3").textContent = title;
                        })
                        .catch(() => {
                            // If fetching title fails, the directory name remains as the title
                            console.warn(`Could not fetch title for: ${dirName}`);
                        });
                });
            })
            .catch(error => {
                projectListContainer.innerHTML = "<p>記事一覧の読み込みに失敗しました。</p>";
                console.error("Error fetching repository contents:", error);
            });
    }
});