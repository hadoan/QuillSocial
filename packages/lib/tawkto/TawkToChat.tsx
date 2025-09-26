import React, { useEffect } from 'react';
import { useTawkTo, UseTawkToOptions } from './useTawkTo';
import { TawkToVisitor } from './types';

export interface TawkToChatProps extends UseTawkToOptions {
  /** Whether to render any UI (useful for debugging) */
  visible?: boolean;
  /** Custom className for the wrapper */
  className?: string;
  /** User information to pre-populate */
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  /** Whether to automatically identify users */
  autoIdentify?: boolean;
  /** Events to track automatically */
  trackEvents?: {
    pageView?: boolean;
    userLogin?: boolean;
    userSignup?: boolean;
  };
}

/**
 * TawkToChat Component
 * A React component wrapper for Tawk.to live chat
 * Handles automatic user identification and event tracking
 */
export const TawkToChat: React.FC<TawkToChatProps> = ({
  visible = false,
  className,
  user,
  autoIdentify = true,
  trackEvents = {},
  ...options
}) => {
  const {
    isLoaded,
    status,
    isChatOngoing,
    isVisible: widgetVisible,
    setVisitorAttributes,
    addEvent,
    addTags,
    ...tawkTo
  } = useTawkTo(options);

  // Auto-identify user when available
  useEffect(() => {
    if (isLoaded && user && autoIdentify) {
      const visitorData: TawkToVisitor = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        ...Object.fromEntries(
          Object.entries(user).filter(([key]) => !['name', 'email', 'phone'].includes(key))
        ),
      };

      setVisitorAttributes(visitorData, (error) => {
        if (error) {
          console.error('Failed to set visitor attributes:', error);
        } else if (options.debug) {
          console.log('Visitor attributes set successfully');
        }
      });
    }
  }, [isLoaded, user, autoIdentify, setVisitorAttributes, options.debug]);

  // Track page view
  useEffect(() => {
    if (isLoaded && trackEvents.pageView) {
      addEvent('page-view', {
        url: typeof window !== 'undefined' ? window.location.pathname : '',
        timestamp: new Date().toISOString(),
      });
    }
  }, [isLoaded, trackEvents.pageView, addEvent]);

  // Track user login
  useEffect(() => {
    if (isLoaded && user && trackEvents.userLogin) {
      addEvent('user-login', {
        userId: user.id || user.email,
        email: user.email,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isLoaded, user, trackEvents.userLogin, addEvent]);

  // Debug rendering
  if (visible && options.debug) {
    return (
      <div className={`tawk-to-debug ${className || ''}`} style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 10000
      }}>
        <div><strong>Tawk.to Debug Info</strong></div>
        <div>Loaded: {isLoaded ? '✓' : '✗'}</div>
        <div>Status: {status || 'Unknown'}</div>
        <div>Chat Ongoing: {isChatOngoing ? '✓' : '✗'}</div>
        <div>Widget Visible: {widgetVisible ? '✓' : '✗'}</div>
        <div>User: {user?.email || 'Anonymous'}</div>
      </div>
    );
  }

  // Component doesn't render any visible UI by default
  // The Tawk.to widget is injected by the script
  return null;
};

/**
 * TawkToProvider Component
 * Provides Tawk.to context to child components
 */
export interface TawkToProviderProps {
  children: React.ReactNode;
  config?: UseTawkToOptions;
}

const TawkToContext = React.createContext<ReturnType<typeof useTawkTo> | null>(null);

export const TawkToProvider: React.FC<TawkToProviderProps> = ({ children, config = {} }) => {
  const tawkTo = useTawkTo(config);

  return (
    <TawkToContext.Provider value={tawkTo}>
      {children}
    </TawkToContext.Provider>
  );
};

/**
 * Hook to use Tawk.to context
 */
export const useTawkToContext = () => {
  const context = React.useContext(TawkToContext);
  if (!context) {
    throw new Error('useTawkToContext must be used within a TawkToProvider');
  }
  return context;
};

/**
 * Higher-order component to add Tawk.to functionality
 */
export function withTawkTo<P extends object>(
  Component: React.ComponentType<P>,
  options?: UseTawkToOptions
) {
  const WithTawkToComponent: React.FC<P> = (props) => {
    const tawkTo = useTawkTo(options);

    return (
      <>
        <Component {...props} />
        <TawkToChat {...options} />
      </>
    );
  };

  WithTawkToComponent.displayName = `withTawkTo(${Component.displayName || Component.name})`;
  return WithTawkToComponent;
}
