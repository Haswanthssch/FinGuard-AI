# FinGuard AI Frontend

Production-grade React 18 frontend for the FinGuard AI enterprise fintech platform.

## Tech Stack

- **React 18** - UI framework with concurrent features
- **TypeScript** - Full type safety with strict mode
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **React Query** - Server state management
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Recharts** - Responsive charts
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation

## Project Structure

```
src/
├── app/                 # App initialization
├── pages/              # Route-level components
├── layouts/            # Layout components
├── components/         # Reusable UI components (Atomic Design)
├── features/           # Feature-specific logic
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
├── services/           # Business logic & API calls
├── api/                # HTTP client configuration
├── lib/                # Utility functions
├── types/              # TypeScript types
├── schemas/            # Zod validation schemas
├── constants/          # App constants
├── routes/             # Route configuration
└── styles/             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Update `.env.local` with your API URL:

```
VITE_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Architecture

### Component Organization (Atomic Design)

**Atoms**: Basic UI blocks (Button, Input, Badge, Spinner)
**Molecules**: Combinations of atoms (FormField, Card, Modal)
**Organisms**: Complex components (Sidebar, Header, DataTable)
**Templates**: Page layouts (MainLayout, AuthLayout)

### State Management

- **Zustand Stores**: Global state (auth, app, portfolio, fraud)
- **React Query**: Server state (API data caching)
- **Local State**: Component-level state with useState

### API Layer

- Centralized Axios client with interceptors
- JWT token handling
- Automatic token refresh
- Error handling and logging

### Authentication

- Azure AD B2C compatible
- JWT token storage
- Protected routes
- Session persistence

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` types
- Full type coverage
- Explicit return types

### Components

- Functional components only
- < 300 lines per component
- Explicit prop interfaces
- Proper error boundaries

### Styling

- TailwindCSS utility classes
- Dark theme by default
- Responsive design (mobile-first)
- Consistent spacing and colors

### Testing

- Vitest for unit/integration tests
- React Testing Library for components
- Playwright for E2E tests
- 80%+ coverage target

## Key Features

### Dashboard
- KPI cards with animations
- Real-time metrics
- AI recommendations
- Fraud alerts

### Portfolio Intelligence
- Portfolio management
- Performance analysis
- Risk assessment
- Diversification scoring

### Fraud Detection Center
- Real-time fraud alerts
- Risk scoring
- Alert management
- Pattern analysis

### Regulatory AI Assistant
- AI-powered compliance chat
- Regulatory guidance
- Document citations
- Quick questions

### Reports
- Report generation
- Multiple templates
- Export functionality
- Compliance reports

### CSV Upload
- Drag-and-drop interface
- File validation
- Batch processing
- Progress tracking

## Performance

- Code splitting by route
- Lazy loading of components
- Image optimization
- Bundle size < 200KB gzipped
- Lighthouse score > 85

## Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast (4.5:1)
- Focus indicators

## Development Workflow

### Before Commit

```bash
npm run format
npm run type-check
npm run lint
npm run test
```

### Before PR

- All tests passing
- 80%+ coverage
- Accessibility audit passing
- Performance acceptable
- Documentation updated

## Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Environment Variables

Set these in your deployment platform:

```
VITE_API_URL=https://api.finguard.com
VITE_APP_NAME=FinGuard AI
VITE_APP_VERSION=0.1.0
```

## Troubleshooting

### Port Already in Use

```bash
npm run dev -- --port 3000
```

### Clear Cache

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
npm run type-check
```

## Contributing

1. Create a feature branch
2. Follow code standards
3. Write tests
4. Submit PR with description

## License

Proprietary - FinGuard AI
