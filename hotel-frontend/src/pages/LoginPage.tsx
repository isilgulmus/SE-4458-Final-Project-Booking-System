import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError("❌ Invalid username or password");
        return;
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);

      const decoded = JSON.parse(atob(data.access_token.split(".")[1]));
      const role = decoded.role;

      if (role === "admin") navigate("/admin");
      else navigate("/user");
    } catch (error) {
      console.error("Login failed", error);
      setError("⚠️ Something went wrong. Please try again.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f4f4f4",
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#fff",
        padding: "32px",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(0,0,0,0.08)"
      }}>
        <h2 style={{
          textAlign: "center",
          marginBottom: "24px",
          fontSize: "24px",
          color: "#333"
        }}>🔐 Login</h2>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: "14px" }}>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px"
            }}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "16px"
            }}
          />

          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "#007bff",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0056d2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
          >
            Login
          </button>

          {error && (
            <div style={{
              color: "#d9534f",
              backgroundColor: "#f8d7da",
              padding: "10px",
              borderRadius: "6px",
              textAlign: "center",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
