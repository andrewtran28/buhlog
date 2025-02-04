import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Fetch from .env

function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login"); // Redirect to home
      } else {
        setErrorMessage(data.message);
        setUsername("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div id="login">
      <h1 id="title">Sign Up</h1>
      <form onSubmit={handleSignup}>
        <label>Username:</label>
        <input name="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />

        <label>Password:</label>
        <input
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Confirm Password:</label>
        <input
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <br />
        {errorMessage && (
          <span style={{ color: "red" }}>
            {errorMessage}
            <br />
          </span>
        )}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
