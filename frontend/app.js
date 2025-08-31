const API_BASE = "/api";

async function api(path, opts = {}) {
  const res = await fetch(API_BASE + path, opts);
  const json = await res.json();
  return json;
}

async function addCandidate() {
  const id = document.getElementById("candId").value.trim();
  const name = document.getElementById("candName").value.trim();
  const msg = document.getElementById("candMsg");
  if (!id || !name) { msg.textContent = "Enter both id & name"; return; }
  const res = await api("/addCandidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name })
  });
  msg.textContent = res.msg || (res.ok ? "Candidate added" : JSON.stringify(res));
  loadCandidates();
  document.getElementById("candId").value = "";
  document.getElementById("candName").value = "";
}

async function castVote() {
  const voterId = document.getElementById("voterId").value.trim();
  const candidateId = document.getElementById("voteCandId").value.trim();
  const msg = document.getElementById("voteMsg");
  if (!voterId || !candidateId) { msg.textContent = "Enter both voterId & candidateId"; return; }
  const res = await api("/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voterId, candidateId })
  });
  msg.textContent = res.msg || (res.ok ? "Vote recorded" : JSON.stringify(res));
  loadVotes();
  loadCandidates();
  document.getElementById("voterId").value = "";
  document.getElementById("voteCandId").value = "";
}

async function loadCandidates() {
  const box = document.getElementById("candidateList");
  const res = await api("/candidates");
  if (!res.candidates) { box.textContent = "No candidates"; return; }
  box.innerHTML = res.candidates.map(c => `<div class="item">ID: ${c.id} | ${escapeHtml(c.name)} | Votes: ${c.votes}</div>`).join("");
}

async function loadVotes() {
  const box = document.getElementById("voteList");
  const res = await api("/votes");
  if (!res.votes) { box.textContent = "No votes"; return; }
  box.innerHTML = res.votes.map(v => `<div class="item">Voter ${v.voter} → Candidate ${v.candidate}</div>`).join("");
}

async function findWinner() {
  const res = await api("/results");
  const w = res.winner;
  const box = document.getElementById("winner");
  if (!w) box.textContent = "No winner yet.";
  else box.textContent = `🏆 ${w.name} (ID=${w.id}) with ${w.votes} votes`;
}

async function resetAll() {
  if (!confirm("Are you sure? This will clear candidates & votes.")) return;
  const res = await api("/reset", { method: "POST" });
  if (res.ok) {
    loadCandidates(); loadVotes(); document.getElementById("winner").textContent = "";
    alert("Reset successful");
  } else {
    alert("Reset failed: " + JSON.stringify(res));
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" })[m]);
}

document.getElementById("addBtn").addEventListener("click", addCandidate);
document.getElementById("voteBtn").addEventListener("click", castVote);
document.getElementById("refreshC").addEventListener("click", loadCandidates);
document.getElementById("refreshV").addEventListener("click", loadVotes);
document.getElementById("findWinner").addEventListener("click", findWinner);
document.getElementById("resetBtn").addEventListener("click", resetAll);

// initial load
loadCandidates();
loadVotes();
