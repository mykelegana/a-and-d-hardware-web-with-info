# A&D Hardware Web

Full-stack web application for managing hardware inventory, sales, and analytics. Features user authentication, product management, sales tracking, and dashboard analytics.

## Project Structure

```
├── backend/          # NestJS REST API
├── frontend/         # React + Vite SPA
├── .gitignore        # Root-level git ignore
└── README.md         # This file
```

## Technology Stack

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: MySQL + TypeORM
- **Authentication**: JWT + Passport
- **API Docs**: Swagger

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charting**: Recharts

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- MySQL (for backend)

### Backend Setup
```bash
cd backend
npm install
# Configure .env with database credentials
npm run start:dev
```

Backend runs on `http://localhost:3000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Available Scripts

### Backend
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Run production build
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint and fix code

### Frontend
- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Configuration

### Backend (.env)
Create a `.env` file in the `backend/` directory:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=hardware_db
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h
```

### Frontend (.env)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes and API endpoints

### Dashboard
- Sales overview
- Revenue statistics
- Charts and analytics

### Product Management
- Product listing and search
- Add/edit/delete products
- Category management

### Sales Management
- Create and track sales
- Sales history
- Transaction details

### Reports
- Sales reports
- Analytics and insights
- Export to Excel

## API Documentation

Swagger API documentation is available at `http://localhost:3000/api` when the backend is running.

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and test**
   - Backend: `npm run test` and `npm run lint`
   - Frontend: `npm run lint`

3. **Format your code**
   - Backend: `npm run format`

4. **Push and create a pull request**

## Project Guidelines

- Follow consistent code style (enforced by ESLint and Prettier)
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

## Troubleshooting

### Backend
- **Port 3000 already in use**: Change the port in `main.ts`
- **Database connection error**: Verify `.env` credentials and PostgreSQL is running
- **Module not found**: Run `npm install` again

### Frontend
- **Port 5173 already in use**: Vite will auto-assign next available port
- **API connection error**: Verify backend is running and `VITE_API_BASE_URL` is correct
- **Build errors**: Delete `node_modules` and `.node_modules.cache`, then run `npm install`

## License

UNLICENSED

## Support

For questions or issues, please open an issue in the repository.
