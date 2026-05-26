import { useEffect, useState } from 'react';

/**
 * PwaUpdatePrompt
 *
 * Detects when a new service worker is waiting to activate and shows
 * a non-intrusive banner. The user manually triggers the update.
 *
 * Behavior:
 *   - New SW downloads silently in the background (registerType: 'autoUpdate')
 *   - When the new SW is ready, this banner appears
 *   - User clicks "Update" → SW activates → page reloads with new version
 *
 * What this does NOT do:
 *   - Does NOT auto-reload the page
 *   - Does NOT force skipWaiting without user consent
 *   - Does NOT interrupt active work (form fills, etc.)
 */
export function PwaUpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only run in browsers that support service workers
    if (!('serviceWorker' in navigator)) return;

    const handleControllerChange = () => {
      // A new SW has taken control — reload to get the fresh assets
      window.location.reload();
    };

    const checkForWaiting = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowPrompt(true);
      }
    };

    // Check existing registration on mount
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;
      checkForWaiting(registration);

      // Listen for a new SW entering the waiting state
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW installed and waiting — show the prompt
            setWaitingWorker(newWorker);
            setShowPrompt(true);
          }
        });
      });
    });

    // When the SW controller changes (after skipWaiting), reload the page
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  const handleUpdate = () => {
    if (!waitingWorker) return;

    // Tell the waiting SW to skip waiting and take control
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });

    // Hide the prompt — the controllerchange listener above will reload
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position:     'fixed',
        bottom:       20,
        right:        20,
        zIndex:       9999,
        background:   '#1e40af',
        color:        '#ffffff',
        padding:      '14px 18px',
        borderRadius: 10,
        display:      'flex',
        alignItems:   'center',
        gap:          12,
        boxShadow:    '0 4px 16px rgba(0, 0, 0, 0.25)',
        maxWidth:     340,
        fontSize:     14,
      }}
    >
      {/* Bell icon */}
      <span aria-hidden="true" style={{ fontSize: 18 }}>🔄</span>

      <span style={{ flex: 1, lineHeight: 1.4 }}>
        A new version is available.
      </span>

      <button
        onClick={handleUpdate}
        aria-label="Update to new version"
        style={{
          background:   '#ffffff',
          color:        '#1e40af',
          border:       'none',
          borderRadius: 6,
          padding:      '6px 14px',
          cursor:       'pointer',
          fontWeight:   600,
          fontSize:     13,
          whiteSpace:   'nowrap',
          flexShrink:   0,
        }}
      >
        Update
      </button>

      <button
        onClick={handleDismiss}
        aria-label="Dismiss update notification"
        style={{
          background:   'transparent',
          color:        'rgba(255,255,255,0.7)',
          border:       'none',
          cursor:       'pointer',
          fontSize:     18,
          lineHeight:   1,
          padding:      '0 2px',
          flexShrink:   0,
        }}
      >
        ×
      </button>
    </div>
  );
}

export default PwaUpdatePrompt;
