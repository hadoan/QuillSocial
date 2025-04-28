import { z } from 'zod';

export const mediumCredentialSchema = z.object({
    id: z.string(),
    url: z.string().url(),
    name: z.string(),
    imageUrl: z.string().url(),
    username: z.string(),
    integrationToken: z.string(),
});

