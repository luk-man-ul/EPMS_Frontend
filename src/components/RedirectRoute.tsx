import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

interface RedirectRouteProps {
  from: string;
  to: string;
}

/**
 * RedirectRoute component for maintaining backward compatibility
 * by redirecting old routes to new routes.
 * 
 * This component logs a deprecation warning when an old route is accessed
 * and redirects to the new route using React Router's Navigate component.
 * 
 * @param from - The old/deprecated route path
 * @param to - The new route path to redirect to
 */
export function RedirectRoute({ from, to }: RedirectRouteProps): JSX.Element {
  useEffect(() => {
    console.warn(`[DEPRECATED ROUTE] Route "${from}" is deprecated. Redirecting to "${to}".`);
  }, [from, to]);

  return <Navigate to={to} replace />;
}
