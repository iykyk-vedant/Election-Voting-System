# Election Voting System

A full-stack voting application that demonstrates integration between a C program and a modern web interface, with Supabase for persistent data storage.

## Features

- Add candidates with unique IDs
- Cast votes for candidates
- View real-time results
- Find the winner
- Reset the election
- Real-time updates with Supabase
- Responsive UI design

## Architecture

This application uses a hybrid approach:
- **Frontend**: HTML, CSS, and vanilla JavaScript
- **Backend**: Node.js with Express
- **Core Logic**: C program for election operations
- **Persistence**: Supabase database

## Prerequisites

- Node.js (v14 or higher)
- GCC compiler (for C program)
- Supabase account (for database)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Election-Voting-System
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Compile the C program:
   ```bash
   cd backend/c_program
   gcc election.c -o election
   cd ../..
   ```

4. Set up Supabase:
   - Create a Supabase project
   - Update the credentials in `backend/config/supabase.js`
   - Create two tables:
     - `candidates` with columns: id (int, primary key), name (text)
     - `votes` with columns: id (int, primary key), voter_id (int), candidate_id (int)

5. Start the server:
   ```bash
   node server.js
   ```

6. Open your browser to `http://localhost:5000`

## Deploying to Render

1. Fork this repository to your GitHub account
2. Create a new Web Service on Render
3. Connect your forked repository
4. Set the following environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anon key
5. Set the build command to: `npm install`
6. Set the start command to: `node server.js`
7. Deploy!

## API Endpoints

- `POST /api/candidates` - Add a candidate
- `GET /api/candidates` - Get all candidates
- `POST /api/votes` - Cast a vote
- `GET /api/votes` - Get all votes
- `GET /api/results` - Get election results
- `POST /api/reset` - Reset the election

## File Structure

```
Election-Voting-System/
├── backend/
│   ├── c_program/
│   │   ├── election.c    # C source code
│   │   ├── election      # Compiled C program
│   │   └── Makefile
│   ├── config/
│   │   └── supabase.js   # Supabase configuration
│   └── services/
│       └── electionService.js  # Interface to C program
├── frontend/
│   ├── index.html        # Main HTML file
│   ├── style.css         # Styles
│   └── app.js            # Client-side JavaScript
├── package.json          # Project dependencies
├── server.js             # Main server file
└── README.md
```

## How It Works

1. The frontend sends requests to the Node.js backend
2. The backend processes requests and communicates with:
   - The C program for core election logic
   - Supabase for persistent data storage
3. Results are returned to the frontend for display

## Security Notes

- This is a demo application and not intended for production use
- The C program executes with the same privileges as the Node.js server
- Proper input validation should be implemented for production use