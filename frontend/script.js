const API_BASE = "/api";

// Fetch candidates
async function getCandidates() {
  const response = await fetch('http://localhost:5000/api/candidates');
  const data = await response.json();
  return data;
}

// Add candidate
async function addCandidate(name, party) {
  const response = await fetch('http://localhost:5000/api/candidates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, party }),
  });
  return await response.json();
}

// Cast vote
async function castVote(voterId, candidateId) {
  const response = await fetch('http://localhost:5000/api/votes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voter_id: voterId, candidate_id: candidateId }),
  });
  return await response.json();
}

// Get results
async function getResults() {
  const response = await fetch('http://localhost:5000/api/results');
  const data = await response.json();
  return data;
}

// Load Candidates
async function loadCandidates() {
  const res = await fetch(`${API_BASE}/candidates`);
  const data = await res.json();
  const list = document.getElementById("candidatesList");
  list.innerHTML = "";
  data.candidates.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}`;
    list.appendChild(li);
  });
}

// Load Results
async function loadResults() {
  const res = await fetch(`${API_BASE}/results`);
  const data = await res.json();
  const list = document.getElementById("resultsList");
  list.innerHTML = "";
  if (!data.ok) return alert(data.msg);

  const maxVotes = Math.max(...data.results.map(c => c.voteCount));
  data.results.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `ID: ${c.id}, Name: ${c.name}, Votes: ${c.voteCount}`;
    if (c.voteCount === maxVotes && maxVotes > 0) {
      li.style.fontWeight = "bold";
      li.style.color = "green";
      li.textContent += " ← Winner!";
    }
    list.appendChild(li);
  });
}


// Reset Election
async function resetElection() {
  const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
  const data = await res.json();
  alert(data.msg || "Election reset");
  loadCandidates();
  document.getElementById("resultsList").innerHTML = "";
}
