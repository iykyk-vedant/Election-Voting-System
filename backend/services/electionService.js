const { spawn } = require('child_process');
const path = require('path');

// Path to the C program
const electionProgram = path.join(__dirname, '..', 'c_program', 'election');

const electionService = {
  // Execute the C program with given arguments and return a promise with the result
  executeCProgram: (args) => {
    return new Promise((resolve, reject) => {
      console.log(`Executing C program with args: ${args.join(' ')}`);
      const child = spawn(electionProgram, args, { cwd: path.join(__dirname, '..', 'c_program') });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        console.log(`C program exited with code ${code}`);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        
        if (code === 0) {
          try {
            const result = JSON.parse(stdout.trim());
            resolve(result);
          } catch (e) {
            reject(new Error(`Failed to parse JSON output: ${stdout}`));
          }
        } else {
          reject(new Error(`C program exited with code ${code}: ${stderr}`));
        }
      });
      
      child.on('error', (error) => {
        console.error(`Failed to start C program: ${error.message}`);
        reject(new Error(`Failed to start C program: ${error.message}`));
      });
    });
  },

  addCandidate: async function(id, name) {
    try {
      const result = await electionService.executeCProgram(['add', id.toString(), name]);
      return result;
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  },

  vote: async function(voterId, candidateId) {
    try {
      const result = await electionService.executeCProgram(['vote', voterId.toString(), candidateId.toString()]);
      return result;
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  },

  listCandidates: async function() {
    try {
      const result = await electionService.executeCProgram(['list_candidates']);
      return result;
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  },

  listVotes: async function() {
    try {
      const result = await electionService.executeCProgram(['list_votes']);
      return result;
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  },

  results: async function() {
    try {
      const result = await electionService.executeCProgram(['results']);
      return result;
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  },

  reset: async function() {
    try {
      const result = await electionService.executeCProgram(['reset']);
      return result;
    } catch (error) {
      return { ok: false, msg: error.message };
    }
  }
};

module.exports = electionService;