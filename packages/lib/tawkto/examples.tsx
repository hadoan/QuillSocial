/**
 * Example integration of Tawk.to in QuillSocial
 * This demonstrates how to integrate the chat system with user authentication
 */

import { useEffect } from 'react';
import { useTawkTo, TawkToChat } from '@quillsocial/lib/tawkto';
import { useSession } from 'next-auth/react';

// Example 1: Using the hook in a component
export function ChatSupportButton() {
  const { data: session } = useSession();
  const {
    isLoaded,
    show,
    hide,
    setVisitorAttributes,
    addEvent
  } = useTawkTo({
    debug: process.env.NODE_ENV === 'development',
    onChatStarted: () => {
      console.log('User started a chat session');
    },
  });

  // Set user information when logged in
  useEffect(() => {
    if (isLoaded && session?.user) {
      setVisitorAttributes({
        name: session.user.name || '',
        email: session.user.email || '',
        userId: session.user.id,
        userPlan: session.user.plan || 'free',
        signupDate: session.user.createdAt,
      });

      // Track user login
      addEvent('user-authenticated', {
        userId: session.user.id,
        plan: session.user.plan,
        loginTime: new Date().toISOString(),
      });
    }
  }, [isLoaded, session, setVisitorAttributes, addEvent]);

  // Don't show chat for free users (example business logic)
  const canUseChat = session?.user?.plan !== 'free';

  if (!canUseChat) {
    return null;
  }

  return (
    <button
      onClick={show}
      disabled={!isLoaded}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      💬 Get Help
    </button>
  );
}

// Example 2: Using the component approach
export function ChatWidget() {
  const { data: session } = useSession();

  // Only show chat for authenticated users
  if (!session?.user) {
    return null;
  }

  return (
    <TawkToChat
      user={{
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        plan: session.user.plan || 'free',
        company: session.user.company,
      }}
      autoIdentify={true}
      trackEvents={{
        pageView: true,
        userLogin: true,
      }}
      debug={process.env.NODE_ENV === 'development'}
      // Don't auto-start for free users
      autoStart={session.user.plan !== 'free'}
    />
  );
}

// Example 3: Page-specific chat integration
export function ProductSupportPage({ product }) {
  const { addEvent, addTags } = useTawkTo();

  useEffect(() => {
    // Track product page visit
    addEvent('product-page-visit', {
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      visitTime: new Date().toISOString(),
    });

    // Add relevant tags
    addTags([
      'product-support',
      product.category,
      `product-${product.id}`,
    ]);
  }, [product, addEvent, addTags]);

  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Product-specific support */}
      <div className="support-section">
        <h3>Need help with this product?</h3>
        <ChatSupportButton />
      </div>
    </div>
  );
}

// Example 4: Error boundary with chat support
export function ErrorBoundaryWithChat({ error, reset }) {
  const { addEvent, show } = useTawkTo();

  useEffect(() => {
    // Track errors
    addEvent('error-occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, [error, addEvent]);

  const handleGetHelp = () => {
    // Pre-fill chat with error context
    show();
  };

  return (
    <div className="error-boundary">
      <h2>Something went wrong</h2>
      <p>We've logged this error and our team has been notified.</p>

      <div className="error-actions">
        <button onClick={reset}>Try again</button>
        <button onClick={handleGetHelp}>Get help from support</button>
      </div>
    </div>
  );
}

// Example 5: Conditional chat loading based on user segment
export function ConditionalChat() {
  const { data: session } = useSession();
  const { load, hide, show } = useTawkTo({
    autoLoad: false, // Don't auto-load
  });

  useEffect(() => {
    if (!session?.user) return;

    const userSegment = getUserSegment(session.user);

    // Only load chat for premium users or trial users
    if (userSegment === 'premium' || userSegment === 'trial') {
      load();
      show();
    } else if (userSegment === 'free') {
      hide(); // Hide for free users
    }
  }, [session, load, hide, show]);

  return null; // No UI, just logic
}

function getUserSegment(user) {
  if (user.plan === 'premium') return 'premium';
  if (user.plan === 'trial') return 'trial';
  return 'free';
}
