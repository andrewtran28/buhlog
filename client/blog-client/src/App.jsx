import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./utils/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Home from "./pages/Home";
import Post from "./pages/Post";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserPage from "./pages/UserPage";
import NewPost from "./pages/NewPost";
import EditPost from "./pages/EditPost";
import ErrorPage from "./pages/ErrorPage";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <AuthProvider>
        <Router>
          <div id="page-layout">
            <div>
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/post/:postSlug" element={<Post />} />
                  <Route path="/post/:postId/edit" element={<ProtectedRoute element={<EditPost />} />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/users/" element={<ProtectedRoute element={<UserPage />} />} />
                  <Route path="/new-post" element={<ProtectedRoute element={<NewPost />} />} />
                  <Route path="*" element={<ErrorPage />} />
                </Routes>
              </main>
            </div>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </>
  );
};

export default App;
