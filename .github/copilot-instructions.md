# Snaprella - AI Coding Instructions

## Project Overview
**Snaprella** is a QR code-based event photo sharing platform built with Next.js 15, featuring multi-tenant architecture, Cloudflare R2 storage, and comprehensive admin management.

## Architecture & Key Patterns

### Authentication System (Dual-track)
- **Customer Auth**: NextAuth.js with credentials provider (`src/auth.ts`, `src/lib/auth.ts`)
- **Admin Auth**: Custom JWT-based system (`src/app/api/admin/login/route.ts`)
- **Middleware**: Separate handling for admin/customer routes (`middleware.ts`, `src/lib/admin-middleware.ts`)

### Multi-tenant Data Model
```prisma
Customer -> Plan (FREE/PRO/ENTERPRISE)
Customer -> Events -> Uploads (photos/videos)
Admin -> System Management
```

### File Storage Strategy
- **Primary**: Cloudflare R2 (`src/lib/r2-service.ts`)
- **Structure**: `customerId/eventId/filename`
- **Migration scripts**: `scripts/migrate-to-r2.ts`
- **Config**: Environment variables with fallbacks

## Essential Development Commands

```bash
# Development with Turbopack (fastest)
pnpm dev

# Database operations
pnpm db:generate && pnpm db:push
pnpm db:seed  # Creates sample data

# R2 Operations
pnpm r2:test    # Test R2 connection
pnpm r2:migrate # Migrate files to R2

# Production deployment
pnpm prod:deploy
```

## Key File Conventions

### Database Schema (`prisma/schema.prisma`)
- SQLite for dev, PostgreSQL for production
- Comprehensive relations: Customer->Plan->Subscription->Payment
- Template system for event customization
- Analytics tracking built-in

### API Route Patterns
- Customer APIs: Standard NextAuth session validation
- Admin APIs: JWT token verification (`adminToken` cookie)
- File uploads: `/api/upload` -> R2 storage
- QR events: `/api/events/[qrCode]`

### Component Structure
- **Admin**: `src/app/admin/` - JWT-protected admin panel
- **Dashboard**: `src/app/dashboard/` - Customer authenticated area  
- **Public**: `src/app/event/[qrCode]/` - Public upload pages
- **UI Components**: `src/components/ui/` - Shadcn/ui based

## Configuration Patterns

### Environment Variables
```bash
# Always required
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="..."
JWT_SECRET="..."  # Admin auth

# R2 Storage (primary)
CLOUDFLARE_R2_BUCKET_NAME="snaprella"
CLOUDFLARE_R2_ACCESS_KEY_ID="..."
CLOUDFLARE_R2_SECRET_ACCESS_KEY="..."
```

### Build Configuration
- **Turbopack**: Default for development (`--turbopack`)
- **Production**: Optimized builds with bundle analysis
- **TypeScript**: `ignoreBuildErrors: true` for rapid development
- **Images**: Remote patterns configured for R2 domains

## Common Integration Points

### QR Code Flow
1. Customer creates event -> generates unique QR code
2. QR leads to `/event/[qrCode]/upload` (public)
3. Files uploaded via drag-drop to R2 storage
4. Template system applies custom styling

### Payment Integration
- Plan-based restrictions (FREE: 3 events, PRO: 50 events, ENTERPRISE: unlimited)
- Bank transfer payment flow with manual approval
- Subscription management in admin panel

### Admin Dashboard
- Customer management with plan changes
- Payment approvals for bank transfers
- System settings (file limits, templates)
- Analytics dashboard with customer metrics

## Development Gotchas

1. **Dual Auth**: Never mix customer/admin auth contexts
2. **R2 Setup**: Must configure CORS for uploads (`scripts/setup-r2-cors.ts`)
3. **Database**: Run `db:generate` after schema changes
4. **File Paths**: Always use absolute paths for R2 keys
5. **Templates**: Event styling uses JSON customization patterns

## Testing & Debugging

- **DB Debug**: `node debug-customers.js` - Shows all customers/admins
- **R2 Test**: `pnpm r2:test` - Validates storage connection
- **Seed Data**: `pnpm db:seed` - Creates realistic test scenarios
- **Health Check**: `/api/health` endpoint available

## Production Considerations

- Switch to PostgreSQL (`DATABASE_URL`)
- Use strong JWT secrets
- Configure custom R2 domain for better performance
- Enable security headers in `next.config.mjs`
- Docker setup available (`Dockerfile`)

This codebase prioritizes rapid development with production scalability - use Turbopack for dev speed, but always test builds before deployment.
