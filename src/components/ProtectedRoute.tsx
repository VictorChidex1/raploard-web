import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute — Guards any route behind Firebase Authentication.
 *
 * States:
 *   loading  → Shows an opaque black screen (prevents layout flash)
 *   no user  → Redirects to /admin/login
 *   user     → Renders the protected children
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // While Firebase resolves the persisted session, show a blank black screen.
  // This prevents the login page from flashing before auth is confirmed.
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span className="font-header text-white/30 text-xs tracking-[0.3em] uppercase">
            Verifying Access
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
