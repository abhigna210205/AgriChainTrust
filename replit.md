# FarmChain - Supply Chain Transparency Platform

## Overview

FarmChain is a blockchain-integrated supply chain transparency platform that enables tracking of agricultural produce from farm to table. The application provides role-based interfaces for farmers, distributors, and consumers to create, manage, and verify produce batches with QR code tracking and supply chain records. Built as a full-stack TypeScript application with React frontend and Express.js backend, it leverages PostgreSQL for data storage and integrates with Neon Database for cloud hosting.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation schemas
- **Mobile-First Design**: Progressive Web App (PWA) with responsive design and offline capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based authentication
- **File Handling**: Multer for certificate uploads with file type validation
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple

### Database Design
- **Primary Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Structure**:
  - Users table with role-based access (farmer, distributor, consumer)
  - Produce batches with QR code generation and status tracking
  - Certificates for verification documents
  - Supply chain records for tracking produce journey
  - Sessions table for authentication state

### Authentication & Authorization
- **Authentication Provider**: Replit Auth with OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Authorization**: Role-based access control with middleware protection
- **User Management**: Profile management with organization details and verification status

### File Storage & Media
- **Upload Handling**: Local file storage for certificates with size and type restrictions
- **QR Code Generation**: Server-side QR code generation for produce batches
- **Static Assets**: Vite-managed static asset serving

### Mobile & Offline Capabilities
- **Service Worker**: Custom PWA implementation with caching strategies
- **Offline Support**: Local data persistence and sync indicators
- **Mobile Features**: Camera integration for QR scanning, responsive navigation

## External Dependencies

### Database & Backend Services
- **Neon Database**: PostgreSQL hosting with serverless connection pooling
- **Drizzle ORM**: Type-safe database queries and migrations
- **Express.js**: Web application framework with middleware support

### Authentication & Security
- **Replit Auth**: OpenID Connect authentication provider
- **Passport.js**: Authentication middleware with strategy pattern
- **Express Sessions**: Session management with PostgreSQL persistence

### Frontend Libraries
- **React Query**: Server state management and caching
- **Shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form state management with validation

### Development & Build Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **Replit Plugins**: Development environment integration

### Utility Libraries
- **QRCode**: QR code generation for produce tracking
- **Date-fns**: Date manipulation and formatting
- **Zod**: Schema validation for forms and API endpoints
- **Multer**: File upload middleware for certificates
- **CMDK**: Command palette component for search functionality