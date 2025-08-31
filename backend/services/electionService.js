// In-memory data storage
let candidates = [];
let votes = [];
let votedUsers = new Set();

const electionService = {
  addCandidate: (id, name) => {
    if (candidates.find(c => c.id === id)) {
      return { ok: false, msg: "candidate_exists" };
    }
    candidates.push({ id, name, voteCount: 0 });
    return { ok: true, msg: "candidate_added", candidates };
  },

  vote: (voterId, candidateId) => {
    if (votedUsers.has(voterId)) {
      return { ok: false, msg: "already_voted" };
    }
    const candidate = candidates.find(c => c.id === candidateId);
    if (!candidate) {
      return { ok: false, msg: "candidate_not_found" };
    }
    candidate.voteCount++;
    votes.push({ voterId, candidateId });
    votedUsers.add(voterId);
    return { ok: true, msg: "vote_casted", candidate };
  },

  listCandidates: () => {
    return { ok: true, candidates };
  },

  listVotes: () => {
    return { ok: true, votes };
  },

  results: () => {
    if (candidates.length === 0) {
      return { ok: false, msg: "no_candidates" };
    }
    const sorted = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
    return { ok: true, results: sorted };
  },

  reset: () => {
    candidates = [];
    votes = [];
    votedUsers = new Set();
    return { ok: true, msg: "reset_done" };
  }
};

module.exports = electionService;
