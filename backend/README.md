# A&D Hardware Web - Backend API

Backend API built with NestJS for the A&D Hardware Web application. Provides REST endpoints for managing products, categories, sales, users, and authentication.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: TypeORM + PostgreSQL
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL database
- Environment variables configured

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file in the backend directory with your database and authentication settings.

## Development

```bash
# Start in watch mode
npm run start:dev

# Start in debug mode
npm run start:debug
```

## Production

```bash
# Build the application
npm run build

# Run production build
npm run start:prod
```

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Code Quality

```bash
# Format code with Prettier
npm run format

# Lint and fix code
npm run lint
```

## Project Structure

```
src/
├── auth/          # Authentication & JWT strategy
├── categories/    # Product categories management
├── dashboard/     # Dashboard statistics
├── products/      # Products management
├── sales/         # Sales & transactions
├── users/         # User management
└── seed/          # Database seeding
```

## API Documentation

Swagger documentation is available at `/api` endpoint when the server is running.

## License

UNLICENSED
