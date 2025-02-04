import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/UserPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function UserPage() {
  const { user, token, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          setUserInfo(data);
          console.log(userInfo);
        } else {
          setErrorMessage(data.message || "Failed to fetch user info.");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setErrorMessage("An error occurred while fetching user info.");
      }
    };

    fetchUserInfo();
  }, [token]);

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!password) {
      setErrorMessage("Enter your password to delete the account.");
      return;
    }

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
      setErrorMessage("An error occurred while deleting your account.");
    } finally {
      setPassword("");
    }
  };

  const handleCancel = () => {
    setShowDeleteForm(false);
    setPassword("");
    setErrorMessage("");
  };

  return (
    <div id="user-page">
      {user ? (
        <>
          <h1 id="title">Your Account</h1>
          <div className="user-info">
            <h2>{user.username}</h2>
            <p>User ID: {user.id}</p>
            {userInfo ? (
              userInfo.isAuthor ? (
                <>
                  <p>
                    Role: <span style={{ color: "red" }}>Author</span>
                  </p>
                  <p>
                    Posts: {userInfo.posts} | Drafts: {userInfo.drafts}
                  </p>
                  <p>Comments: {userInfo.comments}</p>
                </>
              ) : (
                <>
                  <p>
                    Role: <span style={{ color: "green" }}>Reader</span>
                  </p>
                  <p>Comments: {userInfo.comments}</p>
                </>
              )
            ) : (
              <p>Loading user info...</p> // Display this while waiting for the fetch
            )}
          </div>
        </>
      ) : (
        <p>Loading user info...</p>
      )}

      <div className="delete-form">
        {!showDeleteForm && <button onClick={() => setShowDeleteForm(true)}>Delete Account</button>}

        {showDeleteForm && (
          <>
            <hr />
            <form onSubmit={handleDeleteAccount}>
              <h2>Confirm Account Deletion</h2>
              <p>Enter your password to delete your account.</p>
              <input
                className="delete-input"
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
          </>
        )}
      </div>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}

export default UserPage;
