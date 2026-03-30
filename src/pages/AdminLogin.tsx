import { useState, type FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { auth } from "../lib/firebase";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Invalid credentials. Check your email and password.",
  "auth/user-not-found": "No admin account found with that email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/too-many-requests": "Too many attempts. Account temporarily locked.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(ERROR_MESSAGES[code] ?? "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-brand-dark flex items-center justify-center relative overflow-hidden">
      {/* ── Background atmosphere ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Central gold glow — like a spotlight on a dark stage */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand-gold/[0.04] blur-[120px]" />
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,215,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* ── Login card ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md mx-6"
      >
        <div
          className="bg-white/[0.025] backdrop-blur-md border border-white/[0.06] rounded-sm px-10 py-12"
          style={{ borderTop: "1px solid rgba(255, 215, 0, 0.25)" }}
        >
          {/* ── Branding ─────────────────────────────────────────────── */}
          <div className="text-center mb-10">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.35em" }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="font-header text-brand-gold text-[10px] uppercase mb-3"
            >
              RAPLOARD
            </motion.p>
            <h1 className="font-header text-white text-5xl uppercase tracking-tight leading-none">
              The Vault
            </h1>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "2.5rem" }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-px bg-brand-gold mx-auto mt-5"
            />
            <p className="text-white/25 text-xs tracking-widest uppercase mt-4 font-header">
              Command Center Access
            </p>
          </div>

          {/* ── Form ─────────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-white/40 text-[10px] tracking-[0.2em] uppercase mb-2 font-header"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3.5 rounded-sm text-sm focus:outline-none focus:border-brand-gold/50 transition-colors duration-200 disabled:opacity-50"
                placeholder="admin@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-white/40 text-[10px] tracking-[0.2em] uppercase mb-2 font-header"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 px-4 py-3.5 pr-12 rounded-sm text-sm focus:outline-none focus:border-brand-gold/50 transition-colors duration-200 disabled:opacity-50"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3"
              >
                <Lock className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-400 text-xs leading-relaxed">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              id="vault-enter-btn"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 bg-brand-gold text-brand-dark font-header text-sm tracking-[0.2em] uppercase py-4 rounded-sm hover:bg-yellow-400 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/60 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/60 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-dark/60 animate-bounce [animation-delay:0.15s]" />
                </>
              ) : (
                "Enter The Vault"
              )}
            </button>
          </form>

          {/* ── Footer disclaimer ─────────────────────────────────────── */}
          <p className="text-center text-white/15 text-[10px] tracking-widest uppercase mt-10">
            Unauthorized access is prohibited
          </p>
        </div>
      </motion.div>
    </div>
  );
}
