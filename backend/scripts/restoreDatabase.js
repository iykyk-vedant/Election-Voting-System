const supabase = require('../config/supabase');

async function restoreDatabase() {
  console.log('=== Election Voting System Database Setup ===\n');
  
  try {
    // Check if candidates table exists and has the correct structure
    console.log('1. Checking candidates table...');
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(1);
    
    if (candidatesError && (candidatesError.message.includes('relation') || candidatesError.message.includes('not exist'))) {
      console.log('   ❌ Candidates table does not exist');
    } else {
      console.log('   ✅ Candidates table exists');
      console.log('   Sample data:', candidatesData);
    }
    
    // Check if votes table exists and has the correct structure
    console.log('\n2. Checking votes table...');
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1);
    
    if (votesError && (votesError.message.includes('relation') || votesError.message.includes('not exist'))) {
      console.log('   ❌ Votes table does not exist');
    } else {
      console.log('   ✅ Votes table exists');
      console.log('   Sample data:', votesData);
    }
    
    console.log('\n=== Database Structure Required ===');
    console.log(`
candidates table:
- id (integer, primary key)
- name (text)

votes table:
- id (integer, primary key)
- voter_id (integer)
- candidate_id (integer)
    `);
    
    console.log('\n=== How to Fix ===');
    console.log('Since you restored your Supabase project, you need to recreate the tables.');
    console.log('You can do this in two ways:');
    console.log('\nOption 1: Using Supabase SQL Editor');
    console.log('Run the following SQL commands in your Supabase SQL editor:');
    console.log(`
-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name TEXT
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  voter_id INTEGER,
  candidate_id INTEGER
);

-- Enable RLS (Row Level Security) - optional but recommended
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
    `);
    
    console.log('\nOption 2: Using Supabase Table Editor');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Table Editor');
    console.log('3. Create a new table "candidates" with columns:');
    console.log('   - id (int, primary key)');
    console.log('   - name (text)');
    console.log('4. Create a new table "votes" with columns:');
    console.log('   - id (int, primary key)');
    console.log('   - voter_id (int)');
    console.log('   - candidate_id (int)');
    
    console.log('\nAfter creating the tables, restart your application server.');
    
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

restoreDatabase();