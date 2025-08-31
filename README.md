# Election Voting System (C + Node.js + Frontend)

## Overview
This is a full-stack election demo:
- **C program** (core election logic, file-based storage) in `backend/c_program/`
- **Node.js** server (bridge) in `backend/` which runs the C binary
- **Frontend** in `frontend/` (HTML/CSS/JS) served by Node

Data files used by the C program:
- `candidates.csv` (id,name)
- `votes.csv` (voterId,candidateId)

These files live in `backend/c_program/`.

## Requirements
- Node.js v14+ (recommended v18+)
- GCC (to compile C code)
- Optional: make (for using Makefile)

## Setup & Run
1. Clone or copy repo to your machine.

2. Build the C program:
```bash
cd Election-Voting-System/backend/c_program
make
# or: gcc election.c -o election
