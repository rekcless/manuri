document.addEventListener("DOMContentLoaded", function () {
    const postContainer = document.getElementById("post-container");
    const pagination = document.getElementById("pagination");
    const postsPerPage = 5;
    let currentPage = 1;
    let posts = [];

    fetch("posts.json")
        .then(response => response.json())
        .then(data => {
            posts = data;
            displayPosts();
        });

    function displayPosts() {
        postContainer.innerHTML = "";
        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        const paginatedPosts = posts.slice(start, end);

        paginatedPosts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("post");
            postElement.innerHTML = `
                <h2><a href="post.html?id=${post.id}">${post.title}</a></h2>
                <p>${post.content.substring(0, 100)}...</p>
                <p><strong>${post.author}</strong> - ${post.date}</p>
            `;
            postContainer.appendChild(postElement);
        });

        updatePagination();
    }

    function updatePagination() {
        pagination.innerHTML = "";
        const totalPages = Math.ceil(posts.length / postsPerPage);

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.innerText = i;
            btn.classList.add("pagination-btn");
            if (i === currentPage) btn.disabled = true;
            btn.addEventListener("click", () => {
                currentPage = i;
                displayPosts();
            });
            pagination.appendChild(btn);
        }
    }
});