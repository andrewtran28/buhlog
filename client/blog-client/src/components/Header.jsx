import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <hr />
      <div>
        <Link to="/">My Blog</Link>
      </div>
      <hr />
      <nav>
        {user ? (
          <div>
            Welcome, <Link to={`/users`}>{user.username}</Link>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login">Login</Link> <br />
            Don't have an account? <Link to="/signup">Sign Up</Link>!
          </div>
        )}
      </nav>
      <hr />
    </header>
  );
}

export default Header;
