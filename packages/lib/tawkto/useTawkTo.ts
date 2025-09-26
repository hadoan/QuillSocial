import { useEffect, useCallback, useRef, useState } from 'react';
import { TawkToConfig, TawkToAPI, TawkToStatus, TawkToVisitor } from './types';
import { isTawkToConfigured, createTawkToConfig } from './config';

export interface UseTawkToOptions extends Partial<TawkToConfig> {
  /** Whether to load Tawk.to automatically on mount */
  autoLoad?: boolean;
  /** Callback when widget loads */
  onLoad?: () => void;
  /** Callback when status changes */
  onStatusChange?: (status: TawkToStatus) => void;
  /** Callback when chat starts */
  onChatStarted?: () => void;
  /** Callback when chat ends */
  onChatEnded?: () => void;
  /** Enable debug logging */
  debug?: boolean;
}

export interface UseTawkToReturn {
  /** Whether Tawk.to is loaded and ready */
  isLoaded: boolean;
  /** Current widget status */
  status: TawkToStatus | null;
  /** Whether there's an ongoing chat */
  isChatOngoing: boolean;
  /** Whether the widget is visible */
  isVisible: boolean;
  /** Load Tawk.to widget manually */
  load: () => void;
  /** Show the widget */
  show: () => void;
  /** Hide the widget */
  hide: () => void;
  /** Maximize the chat widget */
  maximize: () => void;
  /** Minimize the chat widget */
  minimize: () => void;
  /** Toggle widget visibility */
  toggle: () => void;
  /** Set visitor attributes */
  setVisitorAttributes: (attributes: TawkToVisitor, callback?: (error?: any) => void) => void;
  /** Add event tracking */
  addEvent: (eventName: string, metadata?: Record<string, any>, callback?: (error?: any) => void) => void;
  /** Add tags to the conversation */
  addTags: (tags: string[], callback?: (error?: any) => void) => void;
  /** End the current chat */
  endChat: () => void;
  /** Get the Tawk.to API instance */
  api: TawkToAPI | null;
}

/**
 * React hook for Tawk.to live chat integration
 * Provides a comprehensive interface for managing Tawk.to widget
 */
export function useTawkTo(options: UseTawkToOptions = {}): UseTawkToReturn {
  const {
    autoLoad = true,
    onLoad,
    onStatusChange,
    onChatStarted,
    onChatEnded,
    debug = false,
    ...configOptions
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [status, setStatus] = useState<TawkToStatus | null>(null);
  const [isChatOngoing, setIsChatOngoing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const scriptLoadedRef = useRef(false);
  const configRef = useRef<TawkToConfig | null>(null);

  const log = useCallback((message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[TawkTo] ${message}`, ...args);
    }
  }, [debug]);

  // Initialize configuration
  useEffect(() => {
    if (!isTawkToConfigured()) {
      console.warn('Tawk.to is not properly configured. Please set NEXT_PUBLIC_TAWK_TO_PROPERTY_ID and NEXT_PUBLIC_TAWK_TO_WIDGET_ID');
      return;
    }

    configRef.current = createTawkToConfig(configOptions);
    log('Configuration initialized', configRef.current);
  }, [configOptions, log]);

  // Setup Tawk.to API and callbacks
  const setupTawkToAPI = useCallback(() => {
    if (typeof window === 'undefined' || !window.Tawk_API) return;

    const api = window.Tawk_API;
    log('Setting up Tawk.to API callbacks');

    // Setup callbacks
    api.onLoad = () => {
      log('Widget loaded');
      setIsLoaded(true);
      onLoad?.();
    };

    api.onStatusChange = (newStatus: TawkToStatus) => {
      log('Status changed to:', newStatus);
      setStatus(newStatus);
      onStatusChange?.(newStatus);
    };

    api.onChatStarted = () => {
      log('Chat started');
      setIsChatOngoing(true);
      onChatStarted?.();
    };

    api.onChatEnded = () => {
      log('Chat ended');
      setIsChatOngoing(false);
      onChatEnded?.();
    };

    api.onChatMaximized = () => {
      log('Chat maximized');
      setIsVisible(true);
    };

    api.onChatMinimized = () => {
      log('Chat minimized');
    };

    api.onChatHidden = () => {
      log('Chat hidden');
      setIsVisible(false);
    };

  }, [onLoad, onStatusChange, onChatStarted, onChatEnded, log]);

  // Load Tawk.to script
  const loadScript = useCallback(() => {
    if (scriptLoadedRef.current || !configRef.current || typeof window === 'undefined') {
      return;
    }

    const config = configRef.current;
    log('Loading Tawk.to script', config);

    // Initialize Tawk_API
    window.Tawk_API = window.Tawk_API || ({} as TawkToAPI);
    window.Tawk_LoadStart = new Date();

    // Set configuration
    if (config.autoStart === false && window.Tawk_API) {
      window.Tawk_API.autoStart = false;
    }

    if (config.visitor && window.Tawk_API) {
      window.Tawk_API.visitor = config.visitor;
    }

    if (config.zIndex && window.Tawk_API) {
      window.Tawk_API.customStyle = {
        zIndex: config.zIndex
      };
    }

    // Setup API callbacks
    setupTawkToAPI();

    // Load the script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    script.onload = () => {
      log('Script loaded successfully');
      scriptLoadedRef.current = true;
    };

    script.onerror = () => {
      console.error('Failed to load Tawk.to script');
    };

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);

  }, [setupTawkToAPI, log]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && configRef.current) {
      loadScript();
    }
  }, [autoLoad, loadScript]);

  // API methods
  const show = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.showWidget();
      log('Widget shown');
    }
  }, [log]);

  const hide = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.hideWidget();
      log('Widget hidden');
    }
  }, [log]);

  const maximize = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.maximize();
      log('Widget maximized');
    }
  }, [log]);

  const minimize = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.minimize();
      log('Widget minimized');
    }
  }, [log]);

  const toggle = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.toggle();
      log('Widget toggled');
    }
  }, [log]);

  const setVisitorAttributes = useCallback((attributes: TawkToVisitor, callback?: (error?: any) => void) => {
    if (window.Tawk_API) {
      window.Tawk_API.setAttributes(attributes, callback);
      log('Visitor attributes set', attributes);
    }
  }, [log]);

  const addEvent = useCallback((eventName: string, metadata?: Record<string, any>, callback?: (error?: any) => void) => {
    if (window.Tawk_API) {
      window.Tawk_API.addEvent(eventName, metadata, callback);
      log('Event added', eventName, metadata);
    }
  }, [log]);

  const addTags = useCallback((tags: string[], callback?: (error?: any) => void) => {
    if (window.Tawk_API) {
      window.Tawk_API.addTags(tags, callback);
      log('Tags added', tags);
    }
  }, [log]);

  const endChat = useCallback(() => {
    if (window.Tawk_API) {
      window.Tawk_API.endChat();
      log('Chat ended');
    }
  }, [log]);

  return {
    isLoaded,
    status,
    isChatOngoing,
    isVisible,
    load: loadScript,
    show,
    hide,
    maximize,
    minimize,
    toggle,
    setVisitorAttributes,
    addEvent,
    addTags,
    endChat,
    api: typeof window !== 'undefined' ? window.Tawk_API || null : null,
  };
}
