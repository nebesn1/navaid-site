(function () {
  const searchRoot = document.querySelector("[data-pagefind-search]");

  if (!searchRoot) {
    return;
  }

  const searchInput = searchRoot.querySelector("#blog-search-input");
  const resultsContainer = searchRoot.querySelector("#pagefind-results");
  const emptyMessage = searchRoot.querySelector("#pagefind-empty");
  const staticPostList = document.querySelector("#static-post-list");

  if (!searchInput || !resultsContainer || !emptyMessage || !staticPostList) {
    return;
  }

  const currentLang = searchRoot.dataset.lang || document.documentElement.lang || "zh";
  let pagefindPromise;
  let searchToken = 0;

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getPagefind() {
    if (!pagefindPromise) {
      pagefindPromise = import("/pagefind/pagefind.js");
    }

    return pagefindPromise;
  }

  function showStaticPosts() {
    staticPostList.hidden = false;
    resultsContainer.hidden = true;
    emptyMessage.hidden = true;
    resultsContainer.innerHTML = "";
  }

  function renderEmpty() {
    staticPostList.hidden = true;
    resultsContainer.hidden = true;
    emptyMessage.hidden = false;
    resultsContainer.innerHTML = "";
  }

  function renderResults(results) {
    if (!results.length) {
      renderEmpty();
      return;
    }

    staticPostList.hidden = true;
    resultsContainer.hidden = false;
    emptyMessage.hidden = true;

    const items = results
      .map((result) => {
        const title = escapeHtml(result.meta?.title || result.sub_results?.[0]?.title || result.url);
        const url = escapeHtml(result.url);
        const excerpt = result.excerpt || "";

        return `
          <li class="pagefind-result">
            <article>
              <h2 class="pagefind-result-title"><a href="${url}">${title}</a></h2>
              ${excerpt ? `<p class="pagefind-result-excerpt">${excerpt}</p>` : ""}
            </article>
          </li>
        `;
      })
      .join("");

    resultsContainer.innerHTML = `<ul class="pagefind-result-list">${items}</ul>`;
  }

  async function runSearch() {
    const query = searchInput.value.trim();
    const token = ++searchToken;

    if (!query) {
      showStaticPosts();
      return;
    }

    staticPostList.hidden = true;
    resultsContainer.hidden = true;
    emptyMessage.hidden = true;
    resultsContainer.innerHTML = "";

    try {
      const pagefind = await getPagefind();
      const search = await pagefind.search(query, {
        filters: {
          lang: currentLang,
          section: "blog",
        },
      });

      if (token !== searchToken) {
        return;
      }

      const results = await Promise.all(search.results.map((result) => result.data()));

      if (token !== searchToken) {
        return;
      }

      renderResults(results);
    } catch {
      if (token === searchToken) {
        renderEmpty();
      }
    }
  }

  searchInput.addEventListener("input", runSearch);
  showStaticPosts();
})();
