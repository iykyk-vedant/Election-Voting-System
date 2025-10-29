const supabase = require('../config/supabase');

async function fixDatabaseStructure() {
  console.log('=== Fixing Database Structure ===\n');
  
  try {
    // First, let's check what tables exist
    console.log('1. Checking existing tables...');
    
    // Try to access the voters table
    const { data: votersData, error: votersError } = await supabase
      .from('voters')
      .select('*')
      .limit(1);
    
    if (votersError) {
      console.log('   No voters table found or access error');
    } else {
      console.log('   ✅ Voters table exists');
    }
    
    // Try to access the votes table
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1);
    
    if (votesError) {
      console.log('   ❌ Votes table does not exist or access error');
    } else {
      console.log('   ✅ Votes table exists');
    }
    
    // Solution: Create the correct votes table
    console.log('\n2. Fixing database structure...');
    console.log('   Since the restored database has incorrect structure,');
    console.log('   we need to create the proper votes table.');
    console.log('   Please run the following SQL in your Supabase SQL editor:\n');
    
    console.log(`
-- If voters table exists and is incorrect, you might want to drop it
-- WARNING: This will delete all data in the voters table
-- DROP TABLE IF EXISTS voters;

-- Create the correct votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter_id INTEGER,
  candidate_id INTEGER
);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Test insert to verify structure
INSERT INTO votes (voter_id, candidate_id) VALUES (1, 1);
    `);
    
    console.log('\n3. Alternative Solution:');
    console.log('   If you prefer to keep the existing voters table and just rename it:');
    console.log('   a. Rename the voters table to votes in Supabase dashboard');
    console.log('   b. Make sure it has voter_id and candidate_id columns');
    console.log('   c. Add an id column as primary key if it does not exist');
    
    console.log('\n4. After fixing the database structure:');
    console.log('   - Restart your application server');
    console.log('   - Test adding a candidate and casting a vote');
    
  } catch (error) {
    console.error('Error fixing database structure:', error);
  }
}

fixDatabaseStructure();