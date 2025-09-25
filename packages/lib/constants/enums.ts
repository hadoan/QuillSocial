// Shared enums to avoid Prisma client generation issues in Docker builds
export enum PostStatus {
  NEW = 'NEW',
  SCHEDULED = 'SCHEDULED',
  POSTED = 'POSTED',
  ERROR = 'ERROR'
}
