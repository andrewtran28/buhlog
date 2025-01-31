import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserPage() {
  const { user, token, logout } = useAuth();
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setPassword("");

    if (!password) return setErrorMessage("Enter your password to delete the account.");

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        logout();
        navigate("/");
      } else {
        setErrorMessage(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("An error occured while deleting your account.");
    }
  };

  const handleCancel = () => {
    setShowDeleteForm(false);
    setPassword("");
    setErrorMessage("");
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.username}</h2>
          <p>Username: {user.username}</p>
          <p>User ID: {user.id}</p>
          <p>
            Role:{" "}
            {user.isAuthor ? (
              <span style={{ color: "red" }}>Author</span>
            ) : (
              <span style={{ color: "green" }}>Member</span>
            )}
          </p>
        </div>
      ) : (
        <p>Loading user info...</p>
      )}

      {!showDeleteForm && <button onClick={() => setShowDeleteForm(true)}>Delete Account</button>}

      {showDeleteForm && (
        <form onSubmit={handleDeleteAccount}>
          <h2>Confirm Account Deletion</h2>
          <p>Enter your password to delete your account.</p>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div>
            <button type="submit">Delete Account</button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default UserPage;
