import { useEffect, useState } from "react";
import "./Login.css";

import api, { errorMessage } from "../../services/api.js";

/* =========================================================
   ROLE REDIRECTS
   ========================================================= */

const ROLE_REDIRECT = {
  candidate: "/candidate",
  alumni: "/alumni",
  recruiter: "/recruiter",
  placement_officer: "/placement",
  college_admin: "/college-admin",
  super_admin: "/super-admin",
};

/* =========================================================
   DEMO ACCOUNTS (seeded in the backend; for the hint panel)
   ========================================================= */

const DEMO_ACCOUNTS = [
  { role: "Candidate",         email: "c@gmail.com",           password: "123" },
  { role: "Alumni",            email: "a@gmail.com",           password: "123" },
  { role: "Recruiter",         email: "r@gmail.com",           password: "123" },
  { role: "Placement Officer", email: "p@gmail.com",           password: "123" },
  { role: "College Admin",     email: "ca@iiit.in",            password: "123" },
  { role: "Super Admin",       email: "superadmin@platform.com", password: "123" },
];

/* =========================================================
   APP
   ========================================================= */

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDemoHints, setShowDemoHints] = useState(false);

  useEffect(() => {
    document.title = "Login — CareerNest";
    // e.g. "Your account has been deactivated" after being signed out mid-session
    try {
      const notice = sessionStorage.getItem("cn_login_notice");
      if (notice) {
        sessionStorage.removeItem("cn_login_notice");
        setMessage(notice);
        setMessageColor("red");
      }
    } catch { /* storage unavailable */ }
  }, []);

  /* =========================================================
     HELPERS
     ========================================================= */

  const displayMessage = (text, color) => {
    setMessage(text);
    setMessageColor(color);
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  /* =========================================================
     LOGIN
     ========================================================= */

  const login = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    setMessage("");
    setMessageColor("");

    if (!cleanEmail || !cleanPassword) {
      displayMessage("Please enter your email and password.", "red");
      return;
    }

    /* -------------------------------------------------------
       REAL BACKEND LOGIN
       ------------------------------------------------------- */

    setLoading(true);
    setEmail("");
    setPassword("");
    setShowPassword(false);

    try {
      const { data: user } = await api.post("/users/login", {
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!user.accessToken) {
        throw new Error("The server did not create an authenticated session.");
      }

      localStorage.setItem("loggedInUser", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userId", String(user.id));
      localStorage.setItem("accessToken", user.accessToken);
      localStorage.setItem(
        "collegeId",
        user.collegeId != null ? String(user.collegeId) : "null"
      );

      if (user.role === "recruiter") {
        localStorage.setItem("recruiterEmail", user.email);
        localStorage.setItem("recruiterName", user.name);
        localStorage.setItem("recruiterCompany", user.company || "");
      }

      const redirectUrl = ROLE_REDIRECT[user.role];

      if (!redirectUrl) {
        displayMessage(`Unknown role: ${user.role}`, "red");
        setLoading(false);
        return;
      }

      displayMessage("Login successful! Redirecting…", "green");
      setTimeout(() => { window.location.href = redirectUrl; }, 800);

    } catch (error) {
      displayMessage(
        errorMessage(error),
        "red"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordKeyDown = (event) => {
    if (event.key === "Enter") login();
  };

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div className="cn-login" style={{ display: "contents" }}>
      <div className="login-page login-page--single">

        <div className="main-wrapper main-wrapper--single">

          {/* =================================================
              LOGIN CONTAINER
              ================================================= */}

          <div className="login-container">

            {/* LOGO / TITLE */}
            <div className="login-brand">
              <div className="login-brand__icon">
                <i className="fa-solid fa-briefcase"></i>
              </div>
              <h1>CareerNest</h1>
              <p className="login-brand__sub">Sign in to your account</p>
            </div>


            {/* EMAIL */}

            <div className="input-group">
              <p className="label">Email ID</p>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>


            {/* PASSWORD */}

            <div className="input-group">
              <p className="label">Password</p>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handlePasswordKeyDown}
                  autoComplete="current-password"
                />
                <span
                  className="toggle-password"
                  onClick={togglePassword}
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") togglePassword();
                  }}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
            </div>


            {/* LOGIN BUTTON */}

            <button className="login-btn" onClick={login} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>


            {/* MESSAGE */}

            <p id="msg-display" style={{ color: messageColor }}>{message}</p>


            {/* DEMO HINT TOGGLE */}

            <div className="demo-section">
              <button
                className="demo-toggle-btn"
                onClick={() => setShowDemoHints((v) => !v)}
                type="button"
              >
                <i className={`fa-solid ${showDemoHints ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                &nbsp; Demo Accounts
              </button>

              {showDemoHints && (
                <div className="demo-table">
                  {DEMO_ACCOUNTS.map((d) => (
                    <div
                      key={d.role}
                      className="demo-row"
                      onClick={() => {
                        setEmail(d.email);
                        setPassword(d.password);
                        setShowDemoHints(false);
                      }}
                      title={`Click to fill in ${d.role} credentials`}
                    >
                      <span className="demo-role">{d.role}</span>
                      <span className="demo-cred">{d.email} / {d.password}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>


          {/* =================================================
              BACK TO HOME
              ================================================= */}

          <div className="footer-action">
            <button className="home-btn" onClick={handleBackToHome}>
              <i className="fa-solid fa-arrow-left" style={{ marginRight: "6px" }}></i>
              Back To Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
