import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Fetch from .env

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (typeof data.token !== "string") {
          console.error("Received token is not a valid string:", data.token);
          setErrorMessage("Invalid token received from server.");
          return;
        }
        login(data.token); // Store token in sessionStorage
        navigate("/"); // Redirect to home
      } else {
        console.error("Login failed:", data);
        setErrorMessage(data.message);
        setUsername("");
        setPassword("");
      }
    } catch (error) {
      console.error("Network error:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleLogin}>
        <label name="username"> Username: </label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <br />
        <label name="password"> Password: </label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <br />
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        <button type="submit">Login</button>
      </form>
    </>
  );
}

export default Login;
