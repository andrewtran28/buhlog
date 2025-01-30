import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Home from "./pages/Home";
// import Post from "./pages/Post";
import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import UserProfile from "./pages/UserProfile";
// import NewPost from "./pages/NewPost";
// import EditPost from "./pages/EditPost";
import ErrorPage from "./pages/ErrorPage";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/posts/:id" element={<Post />} /> */}
            <Route path="/login" element={<Login />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
            {/* <Route path="/users/:username" element={<ProtectedRoute element={<UserProfile />} />} /> */}
            {/* <Route path="/new-post" element={<ProtectedRoute element={<NewPost />} />} /> */}
            {/* <Route path="/edit-post/:id" element={<ProtectedRoute element={<EditPost />} />} /> */}
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
