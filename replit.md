# replit.md

## Overview

This is a full-stack URL shortener application called "Link Shot" built with Express.js backend and React frontend. The application provides URL shortening services with analytics, QR code generation, premium subscriptions via Dodo payments, and Replit authentication integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Forms**: React Hook Form with Zod validation resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OIDC integration with session-based auth
- **Payment Processing**: Dodo payments integration for premium subscriptions
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple

### Database Schema
- **Users**: Store user profiles with Dodo payment customer/subscription data
- **URLs**: Main table for shortened URLs with metadata
- **Analytics**: Click tracking with device, browser, and geographic data
- **QR Codes**: Generated QR codes associated with URLs
- **Sessions**: Replit auth session storage

## Key Components

### URL Shortening Service
- Generates random short codes using crypto.randomBytes
- Supports custom aliases for premium users
- Tracks click analytics including referrers, user agents, and geographic data
- QR code generation for each shortened URL

### Authentication System
- Replit OIDC integration for seamless authentication
- Session-based authentication with PostgreSQL storage
- User profile management with Dodo payments integration
- Protected routes requiring authentication

### Analytics Engine
- Real-time click tracking with detailed metadata
- Geographic distribution analysis
- Device and browser analytics
- Time-based trend analysis
- Premium-only advanced analytics features

### Premium Subscription System
- Dodo payment processing for premium subscriptions
- Tiered feature access (free vs premium)
- Ad-free experience for premium users
- Enhanced analytics and custom branding for premium users

## Data Flow

1. **URL Shortening**: User submits URL → validation → short code generation → database storage → return shortened URL
2. **URL Resolution**: User clicks short URL → lookup in database → redirect to original URL → record analytics
3. **Analytics**: Click event → parse user agent → extract geographic data → store analytics record
4. **Authentication**: User login → Replit OIDC flow → session creation → user profile lookup/creation
5. **Subscription**: Payment processing → Dodo webhook → update user subscription status

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Web application framework
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Authentication and Payments
- **openid-client**: OIDC authentication client
- **passport**: Authentication middleware
- **Dodo payments**: Payment processing integration
- **express-session**: Session management

### Utilities
- **zod**: Runtime type validation
- **qrcode**: QR code generation
- **memoizee**: Function memoization

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Environment variables for database and API keys
- Replit-specific development tooling integration

### Production Build
- Vite builds frontend to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Single production server serves both API and static files
- PostgreSQL database with connection pooling

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `DODO_SECRET_KEY`: Dodo payments API key for backend
- `VITE_DODO_PUBLIC_KEY`: Dodo payments public key for frontend
- `REPLIT_DOMAINS` & `ISSUER_URL`: Replit OIDC configuration

The application follows a monorepo structure with shared TypeScript types and schema definitions, enabling type safety across the full stack while maintaining clear separation between frontend and backend concerns.