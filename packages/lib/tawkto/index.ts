/**
 * Tawk.to Live Chat Integration Package
 *
 * Provides comprehensive Tawk.to integration for React/Next.js applications
 * with TypeScript support, hooks, components, and utilities.
 *
 * @example Basic usage with hook
 * ```tsx
 * import { useTawkTo } from '@quillsocial/lib/tawkto';
 *
 * function MyComponent() {
 *   const { isLoaded, show, hide, addEvent } = useTawkTo();
 *
 *   useEffect(() => {
 *     if (isLoaded) {
 *       addEvent('component-mounted');
 *     }
 *   }, [isLoaded]);
 *
 *   return (
 *     <button onClick={show}>Open Chat</button>
 *   );
 * }
 * ```
 *
 * @example Using the component
 * ```tsx
 * import { TawkToChat } from '@quillsocial/lib/tawkto';
 *
 * function App() {
 *   const user = { name: 'John Doe', email: 'john@example.com' };
 *
 *   return (
 *     <div>
 *       <TawkToChat
 *         user={user}
 *         autoIdentify={true}
 *         trackEvents={{ pageView: true, userLogin: true }}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */

// Types
export type {
  TawkToAPI,
  TawkToConfig,
  TawkToVisitor,
  TawkToStatus,
  TawkToWindowType,
  TawkToSatisfaction,
} from './types';

// Configuration utilities
export {
  TAWK_TO_CONFIG,
  isTawkToConfigured,
  getTawkToScriptUrl,
  createTawkToConfig,
  generateTawkToHash,
} from './config';

// React hook
export { useTawkTo } from './useTawkTo';
export type { UseTawkToOptions, UseTawkToReturn } from './useTawkTo';

// React components
export {
  TawkToChat,
  TawkToProvider,
  useTawkToContext,
  withTawkTo,
} from './TawkToChat';
export type { TawkToChatProps, TawkToProviderProps } from './TawkToChat';
