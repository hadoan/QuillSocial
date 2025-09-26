# Tawk.to Live Chat Integration

This document provides comprehensive information on integrating and using Tawk.to live chat in your QuillSocial application.

## Overview

Tawk.to is a free live chat messaging platform that allows you to monitor and chat with visitors on your website. This integration provides:

- ✅ TypeScript support with complete type definitions
- ✅ React hooks for easy integration
- ✅ React components for declarative usage
- ✅ Automatic user identification
- ✅ Event tracking capabilities
- ✅ Secure mode support
- ✅ Server-side rendering compatibility
- ✅ Environment-based configuration

## Setup

### 1. Get Your Tawk.to Credentials

1. Sign up for a free account at [Tawk.to](https://dashboard.tawk.to/signup)
2. Create a new property in your dashboard
3. Get your **Property ID** from `Admin > Property Settings`
4. Get your **Widget ID** from `Admin > Channels`

### 2. Configure Environment Variables

Add the following variables to your `.env.local` file:

```bash
# Required
NEXT_PUBLIC_TAWK_TO_PROPERTY_ID=your-property-id-here
NEXT_PUBLIC_TAWK_TO_WIDGET_ID=your-widget-id-here

# Optional - for secure mode
NEXT_PUBLIC_TAWK_TO_SECURE_MODE=true
TAWK_TO_API_KEY=your-api-key-here
```

⚠️ **Important**: The `TAWK_TO_API_KEY` should only be used server-side for security reasons.

### 3. Automatic Integration

The chat widget is automatically loaded on all pages through `_document.tsx` when the environment variables are configured. No additional setup is required for basic functionality.

## Usage

### Option 1: Using the React Hook

The `useTawkTo` hook provides programmatic control over the chat widget:

```tsx
import { useTawkTo } from '@quillsocial/lib/tawkto';

function MyComponent() {
  const {
    isLoaded,
    status,
    isChatOngoing,
    show,
    hide,
    maximize,
    minimize,
    setVisitorAttributes,
    addEvent,
    addTags,
  } = useTawkTo({
    debug: process.env.NODE_ENV === 'development',
    onLoad: () => console.log('Chat loaded!'),
    onChatStarted: () => console.log('Chat started!'),
  });

  const handleUserLogin = (user) => {
    // Set user information
    setVisitorAttributes({
      name: user.name,
      email: user.email,
      userId: user.id,
    });

    // Track login event
    addEvent('user-login', {
      timestamp: new Date().toISOString(),
      userId: user.id,
    });
  };

  return (
    <div>
      <button onClick={show} disabled={!isLoaded}>
        Open Chat
      </button>
      <button onClick={hide} disabled={!isLoaded}>
        Hide Chat
      </button>
      <p>Status: {status}</p>
      <p>Chat ongoing: {isChatOngoing ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### Option 2: Using the React Component

The `TawkToChat` component handles automatic user identification and event tracking:

```tsx
import { TawkToChat } from '@quillsocial/lib/tawkto';

function App() {
  const currentUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    plan: 'premium', // Custom attribute
  };

  return (
    <div>
      <h1>My App</h1>
      
      {/* The chat widget will automatically identify the user */}
      <TawkToChat
        user={currentUser}
        autoIdentify={true}
        trackEvents={{
          pageView: true,
          userLogin: true,
        }}
        debug={process.env.NODE_ENV === 'development'}
      />
    </div>
  );
}
```

### Option 3: Using the Provider Pattern

For apps that need to share chat state across components:

```tsx
import { TawkToProvider, useTawkToContext } from '@quillsocial/lib/tawkto';

function ChatButton() {
  const { show, isLoaded } = useTawkToContext();
  
  return (
    <button onClick={show} disabled={!isLoaded}>
      Need Help?
    </button>
  );
}

function App() {
  return (
    <TawkToProvider config={{ debug: true }}>
      <div>
        <h1>My App</h1>
        <ChatButton />
      </div>
    </TawkToProvider>
  );
}
```

## Advanced Features

### User Authentication & Secure Mode

For secure user identification, enable secure mode:

```tsx
// Server-side API route (pages/api/chat-hash.ts)
import { generateTawkToHash } from '@quillsocial/lib/tawkto';

export default function handler(req, res) {
  const { email } = req.body;
  const hash = generateTawkToHash(email, process.env.TAWK_TO_API_KEY);
  res.json({ hash });
}

// Client-side component
function SecureChat({ user }) {
  const [hash, setHash] = useState('');
  
  useEffect(() => {
    if (user.email) {
      fetch('/api/chat-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      .then(res => res.json())
      .then(data => setHash(data.hash));
    }
  }, [user.email]);

  const { setVisitorAttributes } = useTawkTo();

  useEffect(() => {
    if (hash && user.email) {
      setVisitorAttributes({
        name: user.name,
        email: user.email,
        hash,
      });
    }
  }, [hash, user, setVisitorAttributes]);

  return null;
}
```

### Event Tracking

Track custom events for analytics:

```tsx
function ProductPage({ product }) {
  const { addEvent, addTags } = useTawkTo();

  const handleProductView = () => {
    addEvent('product-view', {
      productId: product.id,
      productName: product.name,
      price: product.price,
      category: product.category,
    });

    addTags(['product-inquiry', product.category]);
  };

  useEffect(() => {
    handleProductView();
  }, [product.id]);

  return <div>Product content...</div>;
}
```

### Conditional Loading

Load chat only under certain conditions:

```tsx
function ConditionalChat({ user, showChat }) {
  const { load, hide, show } = useTawkTo({
    autoLoad: false, // Don't load automatically
  });

  useEffect(() => {
    if (showChat && user.plan === 'premium') {
      load();
    }
  }, [showChat, user.plan, load]);

  // Hide chat for free users
  useEffect(() => {
    if (user.plan === 'free') {
      hide();
    } else {
      show();
    }
  }, [user.plan, hide, show]);

  return null;
}
```

## API Reference

### useTawkTo Hook

```tsx
const {
  isLoaded: boolean,           // Whether Tawk.to is loaded and ready
  status: TawkToStatus | null, // Current status: 'online' | 'away' | 'offline'
  isChatOngoing: boolean,      // Whether there's an ongoing chat
  isVisible: boolean,          // Whether the widget is visible
  load: () => void,           // Load Tawk.to widget manually
  show: () => void,           // Show the widget
  hide: () => void,           // Hide the widget
  maximize: () => void,       // Maximize the chat widget
  minimize: () => void,       // Minimize the chat widget
  toggle: () => void,         // Toggle widget visibility
  setVisitorAttributes,       // Set visitor information
  addEvent,                   // Track custom events
  addTags,                    // Add conversation tags
  endChat: () => void,        // End the current chat
  api: TawkToAPI | null,      // Raw Tawk.to API instance
} = useTawkTo(options);
```

### Configuration Options

```tsx
interface UseTawkToOptions {
  propertyId?: string;        // Override property ID
  widgetId?: string;          // Override widget ID
  autoLoad?: boolean;         // Auto-load on mount (default: true)
  autoStart?: boolean;        // Auto-start connection (default: true)
  zIndex?: number | string;   // Custom z-index
  visitor?: TawkToVisitor;    // Pre-populate visitor info
  secureMode?: boolean;       // Enable secure mode
  debug?: boolean;            // Enable debug logging
  onLoad?: () => void;        // Callback when loaded
  onStatusChange?: (status) => void;   // Callback on status change
  onChatStarted?: () => void; // Callback when chat starts
  onChatEnded?: () => void;   // Callback when chat ends
}
```

## Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check that environment variables are properly set
   - Verify property ID and widget ID are correct
   - Check browser console for errors

2. **User information not showing**
   - Ensure `setVisitorAttributes` is called after `isLoaded` is true
   - For secure mode, verify the hash is generated correctly server-side

3. **TypeScript errors**
   - Make sure to import types from `@quillsocial/lib/tawkto`
   - Check that `window.Tawk_API` is properly typed

### Debug Mode

Enable debug mode to see detailed logs:

```tsx
const { } = useTawkTo({ debug: true });

// Or for the component
<TawkToChat debug={true} visible={true} />
```

### Testing

Test the integration in development:

```bash
# Set your environment variables
NEXT_PUBLIC_TAWK_TO_PROPERTY_ID=your-property-id
NEXT_PUBLIC_TAWK_TO_WIDGET_ID=your-widget-id

# Start the development server
npm run dev
```

## Best Practices

1. **Performance**: The script loads asynchronously and doesn't block page rendering
2. **Privacy**: Only collect necessary user information
3. **Security**: Always use secure mode for sensitive applications
4. **UX**: Consider hiding the widget on mobile for better user experience
5. **Testing**: Test chat functionality in production environment

## Migration from Other Chat Solutions

If you're migrating from other chat solutions, you can gradually transition by:

1. Running both systems in parallel
2. Using the `autoStart: false` option to control when Tawk.to activates
3. Conditionally loading based on user segments or A/B testing

For more information, visit the [official Tawk.to documentation](https://help.tawk.to/) or [JavaScript API documentation](https://developer.tawk.to/jsapi/).
