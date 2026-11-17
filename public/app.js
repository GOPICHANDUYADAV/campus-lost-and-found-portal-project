const API = "/api";
let token = localStorage.getItem("lf_token") || "";
let currentUser = JSON.parse(localStorage.getItem("lf_user") || "null");
let authMode = "login";

const $ = id => document.getElementById(id);
const headers = () => token ? { Authorization: `Bearer ${token}` } : {};
const jsonHeaders = () => ({ ...headers(), "Content-Type": "application/json" });

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}
function showMessage(id, msg, isError = false) {
  const el = $(id); el.textContent = msg; el.style.color = isError ? "#b33d32" : "#176b50";
}
function updateNav() {
  const logged = !!token;
  $("loginBtn").classList.toggle("hidden", logged);
  $("registerBtn").classList.toggle("hidden", logged);
  $("logoutBtn").classList.toggle("hidden", !logged);
  $("dashboardBtn").classList.toggle("hidden", !logged);
  $("adminBtn").classList.toggle("hidden", !logged || currentUser?.role !== "admin");
}
function openAuth(mode) {
  authMode = mode;
  $("authTitle").textContent = mode === "login" ? "Login" : "Create account";
  $("authSubmit").textContent = mode === "login" ? "Login" : "Register";
  $("nameWrap").classList.toggle("hidden", mode === "login");
  $("nameWrap").querySelector("input").required = mode === "register";
  $("switchAuth").innerHTML = mode === "login" ? 'New here? <button type="button">Create an account</button>' : 'Already registered? <button type="button">Login</button>';
  $("authMessage").textContent = "";
  $("authModal").classList.remove("hidden");
}
function closeAuth() { $("authModal").classList.add("hidden"); }
async function api(url, options = {}) {
  const response = await fetch(API + url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.errors?.[0]?.msg || "Request failed");
  return data;
}
function itemCard(item) {
  const icon = item.category === "Electronics" ? "💻" : item.category === "Books & Notes" ? "📚" : item.category === "ID Cards" ? "🪪" : item.category === "Accessories" ? "🎒" : "🔎";
  const image = item.image ? `<img src="${escapeHTML(item.image)}" alt="Item photo" style="width:100%;height:130px;object-fit:cover">` : `<div class="item-image">${icon}</div>`;
  return `<article class="item-card">${image}<div class="item-content"><div class="pills"><span class="pill ${item.type}">${item.type}</span><span class="pill">${escapeHTML(item.category)}</span></div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description)}</p><div class="item-meta"><span>📍 ${escapeHTML(item.location)}</span><span>📅 ${new Date(item.itemDate).toLocaleDateString()}</span></div><button class="secondary" onclick="claimItem('${item._id}')">Submit a claim</button></div></article>`;
}

async function claimItem(itemId) {
  if (!token) {
    openAuth("login");
    showMessage("authMessage", "Please login before submitting a claim.", true);
    return;
  }

  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed; inset:0; background:#172554cc;
    display:grid; place-items:center; z-index:9999; padding:20px;
  `;

  const form = document.createElement("form");
  form.style.cssText = `
    background:white; padding:25px; border-radius:15px;
    width:min(420px,100%); display:grid; gap:15px;
  `;

  const heading = document.createElement("h3");
  heading.textContent = "Submit a Claim";

  const label = document.createElement("label");
  label.textContent = "Describe why this item belongs to you";

  const input = document.createElement("textarea");
  input.required = true;
  input.placeholder = "Enter identifying details...";
  input.style.cssText = "padding:12px; min-height:100px; border:1px solid #ccc; border-radius:8px;";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit Claim";
  submit.style.cssText = "padding:12px; background:#2563EB; color:white; border:0; border-radius:8px; cursor:pointer;";

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "Cancel";
  cancel.style.cssText = "padding:10px; border:1px solid #ccc; border-radius:8px; cursor:pointer;";

  form.append(heading, label, input, submit, cancel);
  overlay.appendChild(form);
  document.body.appendChild(overlay);

  cancel.onclick = () => overlay.remove();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;

    submit.disabled = true;
    submit.textContent = "Submitting...";

    try {
      await api("/claims", {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ itemId, message })
      });

      overlay.remove();
      alert("Claim submitted successfully!");
      await loadItems();
    } catch (err) {
      alert(err.message);
      submit.disabled = false;
      submit.textContent = "Submit Claim";
    }
  };

  input.focus();
}

window.claimItem = claimItem;
async function loadItems() {
  const container = $("itemsGrid");
  container.innerHTML = '<div class="empty">Loading items...</div>';

  try {
    const params = new URLSearchParams();

    const search = $("searchInput").value.trim();
    const type = $("typeFilter").value;
    const category = $("categoryFilter").value;
    const sort = $("sortFilter").value;

    if (search) params.append("search", search);
    if (type) params.append("type", type);
    if (category) params.append("category", category);
    if (sort) params.append("sort", sort);

    const data = await api("/items?" + params.toString());
    
    $("itemCount").textContent = data.items.filter(item => item.status === "open").length;

    container.innerHTML = data.items.length
      ? data.items.map(itemCard).join("")
      : '<div class="empty">No items found.</div>';

  } catch (err) {
    container.innerHTML =
      `<div class="empty">${escapeHTML(err.message)}</div>`;
  }
}



$("itemForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (!token) { openAuth("login"); showMessage("authMessage", "Login is required to report an item.", true); return; }
  const form = e.currentTarget;
  const fd = new FormData(form);
  try {
    const response = await fetch(API + "/items", { method:"POST", headers:headers(), body:fd });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || data.errors?.[0]?.msg || "Could not submit report");
    form.reset(); showMessage("itemMessage", "Your report has been submitted.");
    await loadItems(); await loadDashboard();
  } catch (err) { showMessage("itemMessage", err.message, true); }
});

$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const payload = Object.fromEntries(form.entries());
  try {
    const data = await api("/auth/" + authMode, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    token = data.token; currentUser = data.user;
    localStorage.setItem("lf_token", token); localStorage.setItem("lf_user", JSON.stringify(currentUser));
    updateNav(); closeAuth(); await loadDashboard();
  } catch (err) { showMessage("authMessage", err.message, true); }
});
$("switchAuth").addEventListener("click", () => openAuth(authMode === "login" ? "register" : "login"));
$("loginBtn").onclick = () => openAuth("login");
$("registerBtn").onclick = () => openAuth("register");
$("closeModal").onclick = closeAuth;
$("logoutBtn").onclick = () => {
  token = ""; currentUser = null; localStorage.removeItem("lf_token"); localStorage.removeItem("lf_user");
  updateNav(); $("dashboard").classList.add("hidden"); $("adminPanel").classList.add("hidden");
  alert("Logged out successfully.");
};
$("searchBtn").onclick = loadItems;
$("searchInput").addEventListener("keydown", e => { if (e.key === "Enter") loadItems(); });
$("typeFilter").onchange = loadItems; $("categoryFilter").onchange = loadItems; $("sortFilter").onchange = loadItems;
$("dashboardBtn").onclick = async () => { $("dashboard").classList.remove("hidden"); $("adminPanel").classList.add("hidden"); await loadDashboard(); $("dashboard").scrollIntoView(); };
$("adminBtn").onclick = async () => { $("adminPanel").classList.remove("hidden"); $("dashboard").classList.add("hidden"); await loadAdmin(); $("adminPanel").scrollIntoView(); };

async function loadDashboard() {
  if (!token) return;
  $("dashboard").classList.remove("hidden");
  try {
    const [mine, claims, received] = await Promise.all([
      api("/items/mine", { headers:headers() }),
      api("/claims/mine", { headers:headers() }),
      api("/claims/received", { headers:headers() })
    ]);
    $("myListings").innerHTML = mine.items.length ? mine.items.map(i => `<div class="stack-card"><b>${escapeHTML(i.title)}</b><p>${i.type} · ${escapeHTML(i.location)} · Status: ${i.status}</p><button class="secondary" onclick="updateMyItem('${i._id}')">Mark returned</button></div>`).join("") : '<div class="empty">No listings yet.</div>';
    $("myClaims").innerHTML = claims.claims.length ? claims.claims.map(c => `<div class="stack-card"><b>${escapeHTML(c.item?.title || "Item")}</b><p>Claim status: ${c.status}</p></div>`).join("") : '<div class="empty">No claims submitted.</div>';
    $("receivedClaims").innerHTML = received.claims.length ? received.claims.map(c => `<div class="stack-card"><b>${escapeHTML(c.item?.title || "Item")}</b><p>From: ${escapeHTML(c.claimant?.name || "Student")} · ${escapeHTML(c.message)}<br>Status: ${c.status}</p>${c.status === "pending" ? `<button class="primary" onclick="reviewClaim('${c._id}','approved')">Approve</button><button class="secondary" onclick="reviewClaim('${c._id}','rejected')">Reject</button>` : ""}</div>`).join("") : '<div class="empty">No claims received.</div>';
  } catch (err) { $("myListings").innerHTML = `<div class="empty">${escapeHTML(err.message)}</div>`; }
}
window.updateMyItem = async id => {
  try { await api(`/items/${id}`, { method:"PATCH", headers:jsonHeaders(), body:JSON.stringify({ status:"returned" }) }); await loadDashboard(); await loadItems(); }
  catch (err) { alert(err.message); }
};
window.reviewClaim = async (id, status) => {
  try { await api(`/claims/${id}/review`, { method:"PATCH", headers:jsonHeaders(), body:JSON.stringify({ status }) }); await loadDashboard(); }
  catch (err) { alert(err.message); }
};
async function loadAdmin() {
  try {
    const [stats, items, claims] = await Promise.all([
      api("/admin/stats", { headers:headers() }), api("/admin/items", { headers:headers() }), api("/admin/claims", { headers:headers() })
    ]);
    $("adminStats").innerHTML = Object.entries(stats.stats).map(([k,v]) => `<div class="stat-card"><strong>${v}</strong><span>${k.replace(/[A-Z]/g, x => " "+x).toUpperCase()}</span></div>`).join("");
    $("adminItems").innerHTML = items.items.map(i => `<div class="stack-card"><b>${escapeHTML(i.title)}</b><p>${i.type} · ${escapeHTML(i.location)} · ${i.status} · by ${escapeHTML(i.reportedBy?.name || "Student")}</p><select onchange="adminStatus('${i._id}',this.value)"><option value="">Change status</option><option>open</option><option>claimed</option><option>returned</option><option>closed</option></select></div>`).join("");
    $("adminClaims").innerHTML = claims.claims.length ? claims.claims.map(c => `<div class="stack-card"><b>${escapeHTML(c.item?.title || "Item")}</b><p>${escapeHTML(c.claimant?.name || "Student")} · ${c.status}</p></div>`).join("") : '<div class="empty">No claims.</div>';
  } catch (err) { $("adminStats").innerHTML = `<div class="empty">${escapeHTML(err.message)}</div>`; }
}
window.adminStatus = async (id, status) => {
  if (!status) return;
  try { await api(`/admin/items/${id}/status`, { method:"PATCH", headers:jsonHeaders(), body:JSON.stringify({ status }) }); await loadAdmin(); await loadItems(); }
  catch (err) { alert(err.message); }
};

updateNav();
loadItems();
if (token) loadDashboard();
