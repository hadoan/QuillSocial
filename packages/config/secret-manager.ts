// import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
// import * as dotenv from 'dotenv';
// // Fallback for local development
// dotenv.config();

// export const ProcessEnv = {
//   DEV: 'development',
//   PROD: 'production',
//   TEST: 'test',
//   LOCAL: 'local',
// } as const;

// export const KeyNameSuffix = {
//   [ProcessEnv.DEV]: 'dev',
//   [ProcessEnv.PROD]: 'prod',
//   [ProcessEnv.TEST]: 'test',
//   [ProcessEnv.LOCAL]: 'local',
// } as const;

// type NodeEnvType = typeof ProcessEnv[keyof typeof ProcessEnv];

// function appendSuffix(secretName: string, env: NodeEnvType): string {
//   // Default to local if the environment is not set or recognized
//   const suffix = KeyNameSuffix[env] || KeyNameSuffix[ProcessEnv.LOCAL];
//   return `${secretName}_${suffix}`;
// }

// // Function to get the secret name based on NODE_ENV
// function getSecretName(baseSecretName: string): string {
//   const currentEnv: NodeEnvType = (process.env.NODE_ENV as NodeEnvType) || ProcessEnv.LOCAL;
//   let secretName = `projects/${GCP_PROJECT_ID}/secrets/${appendSuffix(baseSecretName, currentEnv)}/versions/latest`;
//   return secretName;
// }

// // Create a new client
// const client = new SecretManagerServiceClient();
// const GCP_PROJECT_ID = 'vendexos';

// // Function to get secret from Secret Manager or .env file
// export async function getSecret(secretName: string): Promise<string> {
//   let secretFullName = getSecretName(secretName)

//   try {
//     const [version] = await client.accessSecretVersion({ name: secretFullName });
//     return version.payload?.data?.toString() || '';
//   } catch (error) {
//     // Fetch from .env file if secret is not found in GCP Secret Manager
//     if (process.env[secretName]) {
//       return process.env[secretName] as string;
//     }
//     console.error(`Failed to quillsocial secret ${secretName}:`, error);
//     throw new Error(`Secret ${secretName} not found in .env nor GCP Secret Manager.`);
//   }
// }

// export default getSecret;
