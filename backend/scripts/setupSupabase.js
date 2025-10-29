const supabase = require('../config/supabase');

async function setupDatabase() {
  try {
    console.log('=== Election Voting System - Supabase Setup ===\\n');
    
    // Check if candidates table exists with correct structure
    console.log('1. Checking candidates table...');
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(1);
    
    if (candidatesError) {
      if (candidatesError.message.includes('relation') || candidatesError.message.includes('not exist')) {
        console.log('   ❌ Candidates table does not exist.');
        console.log('   Please create it in Supabase dashboard with columns: id (int, primary key), name (text)');
      } else {
        console.log('   ❌ Error accessing candidates table:', candidatesError.message);
      }
    } else {
      console.log('   ✅ Candidates table exists and is accessible.');
    }

    // Check if votes table exists with correct structure
    console.log('\\n2. Checking votes table...');
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1);
    
    if (votesError) {
      if (votesError.message.includes('relation') || votesError.message.includes('not exist')) {
        console.log('   ❌ Votes table does not exist.');
        console.log('   Please create it in Supabase dashboard with columns: id (int, primary key), voter_id (int), candidate_id (int)');
      } else {
        console.log('   ❌ Error accessing votes table:', votesError.message);
      }
    } else {
      console.log('   ✅ Votes table exists and is accessible.');
    }

    console.log('\\n=== Database Setup Complete ===');
    console.log('If any tables are missing, please create them using the SQL commands below:');
    console.log(`
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name TEXT
);

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter_id INTEGER,
  candidate_id INTEGER
);
    `);
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();