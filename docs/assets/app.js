const listView = document.getElementById("list-view");
const detailView = document.getElementById("detail-view");

const votesKey = "rate-it-or-hate-it-votes";
const fallbackImage = "https://placehold.co/640x360/111111/f5f5f5?text=Image+Unavailable";
let games = [];

function formatReleaseDate(value) {
  if (!value) return "Unknown release date";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown release date"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function loadStoredVotes() {
  try {
    const parsed = JSON.parse(localStorage.getItem(votesKey) || "{}");
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function saveStoredVotes(votes) {
  localStorage.setItem(votesKey, JSON.stringify(votes));
}

function mergedRatingCounts(gameId, rating) {
  const votes = loadStoredVotes();
  const vote = votes[`${gameId}:${rating.id}`];
  return {
    likes: rating.likes + (vote === "like" ? 1 : 0),
    dislikes: rating.dislikes + (vote === "dislike" ? 1 : 0),
    voted: Boolean(vote),
  };
}

function renderList() {
  detailView.classList.add("hidden");
  listView.classList.remove("hidden");

  if (!games.length) {
    listView.innerHTML = `
      <h2>Games</h2>
      <p class="empty">No games found in docs/data/games.json yet.</p>
      <p class="empty">Add data there, then commit and push to update GitHub Pages.</p>
    `;
    return;
  }

  const cards = games
    .map(
      (game) => `
      <article class="game-card">
        ${
          game.game_image
            ? `<img class="cover" src="${game.game_image}" alt="${game.game_name}" onerror="this.onerror=null;this.src='${fallbackImage}';" />`
            : `<div class="cover"></div>`
        }
        <h3 class="game-title">${game.game_name}</h3>
        <p class="game-meta">${game.genre} | ${formatReleaseDate(game.release_date)}</p>
        <button class="btn btn-primary" data-open="${game.id}">Open Reviews</button>
      </article>
    `
    )
    .join("");

  listView.innerHTML = `<h2>Games</h2><div class="game-grid">${cards}</div>`;

  listView.querySelectorAll("[data-open]").forEach((button) => {
    button.addEventListener("click", () => {
      location.hash = `game-${button.getAttribute("data-open")}`;
    });
  });
}

function renderDetail(gameId) {
  const game = games.find((item) => String(item.id) === String(gameId));
  if (!game) {
    renderList();
    return;
  }

  listView.classList.add("hidden");
  detailView.classList.remove("hidden");

  const ratingsHtml = (game.ratings || []).length
    ? game.ratings
        .map((rating) => {
          const counts = mergedRatingCounts(game.id, rating);
          return `
            <article class="review-item" data-review="${game.id}:${rating.id}">
              <p class="review-text">${rating.rating_text}</p>
              <div class="vote-row">
                <button class="vote-btn vote-like" data-vote="like" data-game="${game.id}" data-rating="${rating.id}" ${
            counts.voted ? "disabled" : ""
          }>Like (${counts.likes})</button>
                <button class="vote-btn vote-dislike" data-vote="dislike" data-game="${game.id}" data-rating="${rating.id}" ${
            counts.voted ? "disabled" : ""
          }>Dislike (${counts.dislikes})</button>
              </div>
            </article>
          `;
        })
        .join("")
    : `<p class="empty">No reviews yet for this game.</p>`;

  detailView.innerHTML = `
    <button class="btn btn-back" id="back-btn">Back to all games</button>
    <div class="detail-header">
      ${
        game.game_image
          ? `<img class="detail-cover" src="${game.game_image}" alt="${game.game_name}" onerror="this.onerror=null;this.src='${fallbackImage}';" />`
          : `<div class="detail-cover"></div>`
      }
      <div>
        <h2>${game.game_name}</h2>
        <p class="game-meta">${game.genre} | ${formatReleaseDate(game.release_date)}</p>
        ${
          game.youtube_video
            ? `<a class="video-link" href="${game.youtube_video}" target="_blank" rel="noopener noreferrer">Watch Recommended Video</a>`
            : ""
        }
        ${game.video_description ? `<p>${game.video_description}</p>` : ""}
      </div>
    </div>
    <h3>Reviews</h3>
    <div class="review-list">${ratingsHtml}</div>
  `;

  document.getElementById("back-btn").addEventListener("click", () => {
    location.hash = "";
  });

  detailView.querySelectorAll("[data-vote]").forEach((button) => {
    button.addEventListener("click", handleVote);
  });
}

function handleVote(event) {
  const button = event.currentTarget;
  const voteType = button.getAttribute("data-vote");
  const gameId = button.getAttribute("data-game");
  const ratingId = button.getAttribute("data-rating");
  const key = `${gameId}:${ratingId}`;

  const votes = loadStoredVotes();
  if (votes[key]) return;

  votes[key] = voteType;
  saveStoredVotes(votes);

  renderDetail(gameId);
}

function route() {
  const hash = location.hash.replace("#", "").trim();
  if (hash.startsWith("game-")) {
    renderDetail(hash.replace("game-", ""));
  } else {
    renderList();
  }
}

async function init() {
  try {
    const response = await fetch("data/games.json", { cache: "no-store" });
    const payload = await response.json();
    games = Array.isArray(payload.games) ? payload.games : [];
  } catch {
    games = [];
  }

  route();
  window.addEventListener("hashchange", route);
}

init();
