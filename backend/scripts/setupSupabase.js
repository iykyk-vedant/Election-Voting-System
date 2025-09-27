const supabase = require('../config/supabase');

async function setupDatabase() {
  try {
    // Create candidates table
    const { error: candidatesError } = await supabase.rpc('create_candidates_table');
    
    if (candidatesError) {
      console.log('Candidates table may already exist or error creating:', candidatesError);
    } else {
      console.log('Candidates table created successfully');
    }

    // Create votes table
    const { error: votesError } = await supabase.rpc('create_votes_table');
    
    if (votesError) {
      console.log('Votes table may already exist or error creating:', votesError);
    } else {
      console.log('Votes table created successfully');
    }

    // If RPC calls don't work, we'll create tables manually
    // Create candidates table manually
    const { error: candidatesTableError } = await supabase.from('candidates').select('*').limit(1);
    
    if (candidatesTableError && candidatesTableError.message.includes('relation') || candidatesTableError.message.includes('not exist')) {
      console.log('Candidates table does not exist. Please create it in Supabase dashboard with columns: id (int, primary key), name (text)');
    } else {
      console.log('Candidates table exists');
    }

    // Create votes table manually
    const { error: votesTableError } = await supabase.from('votes').select('*').limit(1);
    
    if (votesTableError && votesTableError.message.includes('relation') || votesTableError.message.includes('not exist')) {
      console.log('Votes table does not exist. Please create it in Supabase dashboard with columns: id (int, primary key), voter_id (int), candidate_id (int)');
    } else {
      console.log('Votes table exists');
    }

    console.log('Database setup completed. Please ensure the following tables exist in your Supabase database:');
    console.log('1. candidates: id (int, primary key), name (text)');
    console.log('2. votes: id (int, primary key), voter_id (int), candidate_id (int)');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();