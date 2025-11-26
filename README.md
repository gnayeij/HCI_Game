# Fire Safety Emergency Game

A text-based web game that teaches fire emergency preparedness through critical thinking and time-based decision making.

## Project Structure

```
fire-safety-game/
├── frontend/          # React application
├── backend/           # Node.js/Express API server
├── db-dump/           # An export of the MongoDB Database for this app
```

## Tech Stack

- **Frontend**: React, React Router, Axios
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Authentication**: JWT tokens, bcrypt

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Development Setup

1. Clone the repository
2. Set up backend: `cd backend && npm install`
3. Set up frontend: `cd frontend && npm install`
4. Configure environment variables
5. Start MongoDB
6. Run backend: `npm run dev`
7. Run frontend: `npm start`

## Game Features

- Time-based decision making in fire emergencies
- Multiple scenarios (office, school)
- User accounts and progress tracking
- Admin panel for scenario management
- Cross-platform (PC, mobile, tablet)

### Importing the Database (for others)

1. Make sure [MongoDB Database Tools](https://www.mongodb.com/docs/database-tools/) are installed and running.
2. Copy the `db-dump` folder to your machine.
3. Run the following command to restore the database:

    ```cmd
    mongorestore --db fire-safety-game ./db-dump/fire-safety-game
    ```

---

**Note:**
- These commands work on Windows CMD, PowerShell, and most terminals.
- You may need to add MongoDB's `bin` directory to your PATH if `mongodump` or `mongorestore` are not recognized.
