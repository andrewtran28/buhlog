import { Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import "../styles/Header.css";

type User = {
  id: number;
  username: string;
};

type AuthContextType = {
  user: User | null;
  logout: () => void;
};

function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <div id="header-cont">
        <div className="header-left">
          <Link to="/" className="logo">
            <img className="logo-img" src="/logo.png" />
            Buhlog
          </Link>
          <span className="pronunciation prevent-select">(/bla:g/)</span>
        </div>

        <nav>
          {user ? (
            <div className="header-right">
              <span>
                <span id="hello">Hello, </span>
                <Link to={`/users`}>{user.username}</Link>
              </span>
              <div>
                <Link to={`/users`}>
                  <button>Your Account</button>
                </Link>
                <button onClick={logout}>Logout</button>
              </div>
            </div>
          ) : (
            <div className="header-right">
              <Link to="/login">
                <button>Login</button>
              </Link>
              <Link to="/signup">
                <button>Sign Up</button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
