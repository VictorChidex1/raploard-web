import { Component, type ErrorInfo, type ReactNode } from "react";
import { CONFIG } from "../config";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production you'd send this to an error monitoring service (e.g. Sentry)
    console.error("[ErrorBoundary] Caught an unhandled error:", error, info.componentStack);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = "/";
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100dvh",
          backgroundColor: CONFIG.theme.colors.brandDark,
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,215,0,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Corner accent — top left */}
        <div
          style={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            width: "2.5rem",
            height: "2.5rem",
            borderTop: `2px solid ${CONFIG.theme.colors.brandGold}`,
            borderLeft: `2px solid ${CONFIG.theme.colors.brandGold}`,
          }}
        />

        {/* Corner accent — top right */}
        <div
          style={{
            position: "absolute",
            top: "2rem",
            right: "2rem",
            width: "2.5rem",
            height: "2.5rem",
            borderTop: `2px solid ${CONFIG.theme.colors.brandGold}`,
            borderRight: `2px solid ${CONFIG.theme.colors.brandGold}`,
          }}
        />

        {/* Corner accent — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "2rem",
            width: "2.5rem",
            height: "2.5rem",
            borderBottom: `2px solid ${CONFIG.theme.colors.brandGold}`,
            borderLeft: `2px solid ${CONFIG.theme.colors.brandGold}`,
          }}
        />

        {/* Corner accent — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            right: "2rem",
            width: "2.5rem",
            height: "2.5rem",
            borderBottom: `2px solid ${CONFIG.theme.colors.brandGold}`,
            borderRight: `2px solid ${CONFIG.theme.colors.brandGold}`,
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: "640px", width: "100%" }}>
          {/* Gold overline */}
          <p
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: CONFIG.theme.colors.brandGold,
              marginBottom: "2rem",
            }}
          >
            System Interruption
          </p>

          {/* Large error code */}
          <h1
            style={{
              fontFamily: "Oswald, sans-serif",
              fontSize: "clamp(5rem, 20vw, 12rem)",
              fontWeight: 700,
              lineHeight: 0.85,
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              color: "white",
              marginBottom: "1.5rem",
            }}
          >
            Oh{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(135deg, white, ${CONFIG.theme.colors.brandGold}, white)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Snap.
            </span>
          </h1>

          {/* Divider */}
          <div
            style={{
              width: "4rem",
              height: "1px",
              background: `linear-gradient(to right, transparent, ${CONFIG.theme.colors.brandGold}, transparent)`,
              margin: "0 auto 2rem",
            }}
          />

          {/* Polite message */}
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "1.1rem",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.5)",
              marginBottom: "0.75rem",
            }}
          >
            Something unexpected broke the signal. The {CONFIG.artist.name} experience hit a technical snag on our end.
          </p>
          <p
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "1rem",
              fontStyle: "italic",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "3rem",
            }}
          >
            "Every wave has a moment of stillness." — Try again below.
          </p>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            {/* Primary: Reload */}
            <button
              id="error-boundary-reload-btn"
              onClick={this.handleReload}
              style={{
                backgroundColor: CONFIG.theme.colors.brandGold,
                color: CONFIG.theme.colors.brandDark,
                fontFamily: "Oswald, sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                border: "none",
                padding: "1rem 3rem",
                cursor: "pointer",
                width: "100%",
                maxWidth: "320px",
                transition: "opacity 0.2s ease",
              }}
              onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")}
              onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
            >
              Reload the Experience
            </button>

            {/* Secondary: Go Home */}
            <button
              id="error-boundary-home-btn"
              onClick={this.handleGoHome}
              style={{
                backgroundColor: "transparent",
                color: "rgba(255,255,255,0.5)",
                fontFamily: "Oswald, sans-serif",
                fontWeight: 400,
                fontSize: "0.75rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "0.875rem 3rem",
                cursor: "pointer",
                width: "100%",
                maxWidth: "320px",
                transition: "border-color 0.2s ease, color 0.2s ease",
              }}
              onMouseOver={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = CONFIG.theme.colors.brandGold;
                btn.style.color = CONFIG.theme.colors.brandGold;
              }}
              onMouseOut={(e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.borderColor = "rgba(255,255,255,0.1)";
                btn.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              Return Home
            </button>
          </div>

          {/* Contact line */}
          <p
            style={{
              marginTop: "3rem",
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              color: "rgba(255,255,255,0.2)",
              textTransform: "uppercase",
            }}
          >
            Persistent issue?{" "}
            <a
              href={`mailto:${CONFIG.contact.email}`}
              style={{
                color: CONFIG.theme.colors.brandGold,
                textDecoration: "none",
                opacity: 0.7,
              }}
            >
              {CONFIG.contact.email}
            </a>
          </p>
        </div>
      </div>
    );
  }
}
