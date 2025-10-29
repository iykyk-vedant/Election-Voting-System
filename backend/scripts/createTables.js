const supabase = require('../config/supabase');

async function createTables() {
  try {
    console.log('Creating candidates table...');
    
    // For Supabase, we need to create tables through the dashboard or SQL editor
    // Let's check if we can insert into the tables to verify they exist
    console.log('Checking if candidates table exists...');
    const { data: candidatesData, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .limit(1);
    
    if (candidatesError) {
      console.log('Candidates table may not exist. Please create it manually in Supabase dashboard with columns:');
      console.log('- id (integer, primary key)');
      console.log('- name (text)');
    } else {
      console.log('Candidates table exists and is accessible.');
    }
    
    console.log('Checking if votes table exists...');
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .limit(1);
    
    if (votesError) {
      console.log('Votes table may not exist. Please create it manually in Supabase dashboard with columns:');
      console.log('- id (integer, primary key)');
      console.log('- voter_id (integer)');
      console.log('- candidate_id (integer)');
    } else {
      console.log('Votes table exists and is accessible.');
    }
    
    console.log('\nTo create these tables manually:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Table Editor');
    console.log('3. Create a new table "candidates" with columns: id (int, primary key), name (text)');
    console.log('4. Create a new table "votes" with columns: id (int, primary key), voter_id (int), candidate_id (int)');
    
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

createTables();