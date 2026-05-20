# A&D Hardware Web - Frontend

Modern React frontend for the A&D Hardware Web application. Built with React, Vite, and React Router for fast, responsive user experience.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: CSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **UI Components**: Lucide React
- **Data Visualization**: Recharts
- **Excel Support**: XLSX

## Prerequisites

- Node.js 16+ and npm

## Installation

```bash
npm install
```

## Development

```bash
# Start development server with HMR
npm run dev
```

The app will be available at `http://localhost:5173`

## Production

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## Code Quality

```bash
# Run ESLint
npm run lint
```

## Project Structure

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components (layouts)
├── context/       # Context providers (Auth, Toast)
├── api.js         # API client configuration
├── App.jsx        # Main app component
└── main.jsx       # Entry point
```

## Key Features

- **Authentication**: Login with JWT token management via AuthContext
- **Dashboard**: Sales overview and statistics with charts
- **Products**: Product listing and management
- **Categories**: Category management interface
- **Sales**: Sales tracking and transaction management
- **Reports**: Sales reports and analytics
- **Settings**: Application configuration

## Environment

Create a `.env` file to configure the API endpoint:

```env
VITE_API_BASE_URL=http://localhost:3000
```

## License

UNLICENSED
