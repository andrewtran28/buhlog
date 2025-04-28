import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import Loading from "../components/Loading";
import "../styles/UserPage.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type UserInfo = {
  isAuthor: boolean;
  posts: number;
  drafts: number;
  comments: number;
};

function UserPage() {
  const { user, token, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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
        } else {
          setErrorMessage(data.message || "Failed to fetch user info.");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setErrorMessage("An error occurred while fetching user info.");
      }
    };

    if (user) fetchUserInfo();
  }, [token, user]);

  const handleDeleteAccount = async (e: FormEvent<HTMLFormElement>) => {
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

  if (!user || !userInfo) {
    return <Loading loadMessage="Loading user info" delay={1000} />;
  }

  return (
    <div id="user-page">
      <h1 id="title">Your Account</h1>
      <div className="user-info">
        <h2>{user.username}</h2>
        <p>User ID: {user.id}</p>
        {userInfo.isAuthor ? (
          <>
            <p>
              Role: <span style={{ fontWeight: "600", color: "#ff124a" }}>Author</span>
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
        )}
      </div>

      <div className="delete-form">
        {!showDeleteForm && (
          <button className="danger" onClick={() => setShowDeleteForm(true)}>
            Delete Account
          </button>
        )}

        {showDeleteForm && (
          <>
            <hr />
            <form onSubmit={handleDeleteAccount}>
              <h2 className="delete-confirm">Confirm Account Deletion</h2>
              <div className="delete-cont">
                <p>Enter your password to delete your account.</p>
                <input
                  className="delete-input"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  maxLength={50}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div>
                  <button className="danger" type="submit">
                    Delete Account
                  </button>
                  <button type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
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
