# QuillSocial Copilot Instructions

## Project Overview

QuillSocial is an AI-powered social media management platform built as a **Turborepo monorepo** with Next.js, tRPC, Prisma, and social media integrations. The architecture follows a modular approach with clear separation between the web app, reusable packages, and social platform integrations.

## Architecture & Monorepo Structure

This is a **Yarn 3 workspaces + Turbo** monorepo with these key patterns:

- `apps/web/` - Main Next.js application (`@quillsocial/web`)
- `packages/` - Shared libraries and features
- `packages/app-store/` - Social platform integrations (Facebook, LinkedIn, X/Twitter variants)
- `packages/features/` - Feature modules (auth, shell, settings, payments, etc.)
- `packages/prisma/` - Database schema and client

### Critical Package Dependencies

All internal packages use the `@quillsocial/` namespace:
```typescript
// Common imports pattern
import { trpc } from "@quillsocial/trpc/react";
import prisma from "@quillsocial/prisma";
import { Button } from "@quillsocial/ui";
```

## Development Workflows

### Key Commands
- `yarn dev` - Start development (focuses on web app)
- `yarn build` - Build with Turbo filtering
- `yarn prisma studio` - Database management
- `yarn app-store:build` - Build social integrations
- `yarn app-store:watch` - Watch mode for app store development

### Database Workflow
- Prisma schema is in `packages/prisma/schema.prisma`
- Use `yarn prisma` prefix for Prisma commands
- Database uses PostgreSQL with generated Zod schemas

## App Store Integration Pattern

The **app store system** is central to social media integrations:

### Structure
Each social platform (e.g., `linkedinsocial/`, `xsocial/`) follows this pattern:
```
packages/app-store/[platform]/
├── api/
│   ├── add.ts        # Initiate OAuth flow
│   └── callback.ts   # Handle OAuth callback
├── lib/
│   ├── getClient.ts  # Platform API client
│   └── [platform]CredentialSchema.ts
```

### OAuth Integration Flow
1. **Add endpoint** (`api/add.ts`) - Generates OAuth URL
2. **Callback endpoint** (`api/callback.ts`) - Processes OAuth response
3. **Credential storage** - Encrypted tokens in `Credential` table
4. **Client generation** - Platform-specific API clients in `lib/getClient.ts`

### Key Patterns
- Use `getAppKeysFromSlug()` for app configuration
- Store credentials with `emailOrUserName` for uniqueness
- Check `isUserCurrentProfile` for active account status
- Handle token refresh in client libraries

## Authentication & Social Profiles

### NextAuth Integration
- Custom provider in `packages/features/auth/lib/CustomScopesXProvider.ts`
- Social login updates credentials automatically
- Session management via `useMeQuery()` hook

### Credential Management
```typescript
// Credential uniqueness constraint
@@unique([userId, appId, emailOrUserName])

// Common credential query pattern
const credential = await prisma.credential.findUnique({
  where: { id: credentialId }
});
```

## Frontend Patterns

### Shell Component
The main layout is in `packages/features/shell/Shell.tsx`:
- Handles authentication redirects
- Manages onboarding flow
- Provides navigation structure

### tRPC Usage
```typescript
// Standard pattern for tRPC queries
const query = trpc.viewer.me.useQuery();
const mutation = trpc.viewer.updateProfile.useMutation();
```

### UI Components
- Use `@quillsocial/ui` for all UI components
- Icons from `@quillsocial/ui/components/icon`
- Consistent styling with Tailwind + custom theme

## Important Conventions

### Environment Variables
- Social platform keys via `getAppKeysFromSlug()`
- Encryption key for sensitive credentials: `MY_APP_ENCRYPTION_KEY`
- Database: `DATABASE_URL` (PostgreSQL)

### Error Handling
- Use structured logging via `@quillsocial/lib/logger`
- Standard error responses in API routes
- Client-side error boundaries in Shell

### Code Generation
- Turbo handles build orchestration
- Prisma generates types and Zod schemas
- App store components are generated (see `apps.*.generated.ts`)

## Integration Testing
- Test social integrations via OAuth callback URLs
- Use Prisma Studio for database inspection
- Vitest for unit tests with c8 coverage

## Security Notes
- All OAuth tokens encrypted before storage
- Use `symmetricEncrypt/symmetricDecrypt` for sensitive data
- Credential isolation by userId and platform
- Session-based API authentication required

When working with social integrations, always follow the established OAuth patterns and ensure proper credential encryption. The app store architecture is designed for extensibility - new platforms should follow the existing `api/add.ts` and `api/callback.ts` structure.
