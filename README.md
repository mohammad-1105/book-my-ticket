# Book My Ticket Application

This is a Node.js and Express backend application for a basic movie ticket booking system. The application serves RESTful APIs to handle user authentication, movie listings, seat inventory management, and the ticket booking process. It also serves a static frontend application.

## 🚀 Features

- **User Authentication**: Secure user registration and login using `bcryptjs` for password hashing and `jsonwebtoken` (JWT) for authentication.
- **Movie Catalog**: Fetch movie details and currently running shows.
- **Seat Management**: Real-time view of seat inventory and booking status. Includes 20 seats distributed across rows A through D (5 seats per row).
- **Seat Booking**: Ticket booking flow that ensures double-booking protection. Users can book available seats and cancel their bookings.
- **In-Memory Store**: Currently utilizes an in-memory data store for users, movies, and seats management.
- **Legacy & Versioned APIs**: Supports basic and versioned APIs (`/api/*`) for clean routing.
- **Frontend App Served**: Serves a built-in static frontend application from the `/public` directory.

## 🛠️ Project Architecture

The project is structured with modern ECMAScript Modules (`.mjs`) and organized into feature-based layers:

```
book-my-ticket/
├── index.mjs           # Entry point of the server
├── package.json        # Dependencies and scripts
├── public/             # Static frontend files (HTML/JS/CSS) served by Express
└── src/
    ├── app.mjs         # Express app initialization, middlewares, and route mapping
    ├── config/         # App configuration flags and paths
    ├── data/           # In-memory store (store.mjs) containing initial movies and seats
    ├── middlewares/    # Custom middlewares (e.g., Error handlers, JWT authenticate-token)
    ├── models/         # Data access objects / queries
    ├── routes/         # Express routers (auth, movie, seat, booking APIs)
    ├── services/       # Core business logic (hashing, booking logic, inventory checking)
    ├── utils/          # Helper functions
    └── zod-schema/     # Zod validation schemas for request bodies
```

## ⚙️ Prerequisites

- **Node.js**: v20 or later.
- **npm**: v11+ (or compatible package manager).

## 🚀 Getting Started

Follow the steps below to set up the project locally:

### 1. Clone the repository and install dependencies

```bash
cd book-my-ticket
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory. You can use the provided `.env.example` as a reference:

```bash
cp .env.example .env
```

Ensure the `.env` file contains at least:
```env
PORT=3000
JWT_TOKEN_SECRET=your_jwt_secret_key_here
```

### 3. Start the application

**Run in development mode** (restarts on file changes):
```bash
npm run dev
```

**Run in production mode**:
```bash
npm start
```

The server will start on the configured port (e.g., `http://localhost:3000`).

## 🔄 Project Flow & Workflow

1. **Initialization (`index.mjs` & `src/app.mjs`)**: The application connects all routes, binds the `cors` and `express.json` middlewares, and handles static file serving for the `/public` folder.
2. **Accessing the App**: Navigating to `http://localhost:3000/` serves `public/index.html` (the frontend).
3. **Data Layer (`src/data/store.mjs`)**: An in-memory store is seeded initialized with a sample movie ("Avengers: Endgame") and an array of 20 unbooked seat objects.
4. **Authentication (`src/routes/auth.routes.mjs`)**:
   - New users hit `POST /api/auth/register` to create an account.
   - Returning users hit `POST /api/auth/login` and receive a JWT token.
5. **Seat & Booking Operations**:
   - The frontend queries `GET /api/seats` to display current seat availability.
   - Authenticated users hit `POST /api/bookings` with a valid JWT `Bearer` token to book a seat. The application passes the request through the `authenticateToken` middleware and `booking.services.mjs` ensures the seat is available and secures the booking.
   - Cancellations can be performed via `DELETE /api/bookings/:seatId`.
6. **Error Handling (`src/middlewares/error-handlers.mjs`)**: A centralized error handler catches thrown errors and maps them to appropriate HTTP status codes before responding.

## 🧹 Code Quality

This project uses [Biome](https://biomejs.dev/) for fast formatting and linting.

- Check formatting without modifying files: `npm run check`
- Format all files automatically: `npm run format`
- Fix linting issues automatically: `npm run lint`
