import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Courselist from "./pages/Courselist";
import "./styles/testing.scss";
import Syllabus from "./components/Syllabus";
import MockTest from "./pages/Mocktest";
import CreateMocktest from "./pages/CreateMocktest";
import CourseDetails from "./pages/CourseDetails";
import AdminDashboard from "./pages/AdminCourse";
import MockTestResult from "./pages/MocktestResults";
import ViewMocktestCreator from "./pages/ViewMocktestCreator";
import Classes from "./pages/Classes";
import Classroom from "./pages/Classroom";
import Student from "./pages/Student";
import Teacher from "./pages/Teacher";
import LessonPage from "./pages/LessonPage";
import Home from "./pages/Home";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import ContentCreator from "./pages/ContentCreator";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import { setUserFromLocalStorage } from "./redux/slices/authSlice";
import { useAppDispatch } from "./redux/hooks";
import { Provider } from "react-redux";
import store from "./redux/store";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import QuestionBank from "./pages/QuestionBank";
import DailyChallenge from "./pages/DailyChallenge";
import Preassessment from "./pages/Preassessment";
// import Dashboard from "./pages/Dashboard";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setUserFromLocalStorage());
  }, [dispatch]);

  const AppContent = () => {
    const location = useLocation();
    const noSidebarRoutes = [
      "/home",
      "/content-creator",
      "/student",
      "/teacher",
    ];
    const shouldDisplaySidebar = !noSidebarRoutes.includes(location.pathname);

    return (
      <div className="app-content">
        {shouldDisplaySidebar ? (
          <Sidebar>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <Home />
                  </PublicRoute>
                }
              />
              {/* Other routes here */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/question-bank"
                element={
                  <PrivateRoute>
                    <QuestionBank />
                  </PrivateRoute>
                }
              />
              <Route
                path="/classes"
                element={
                  <PrivateRoute>
                    <Classes />
                  </PrivateRoute>
                }
              />
              <Route
                path="/daily-challenge"
                element={
                  <PrivateRoute>
                    <DailyChallenge />
                  </PrivateRoute>
                }
              />
              <Route
                path="/preassessment"
                element={
                <PrivateRoute>
                  <Preassessment />
                </PrivateRoute>}
              />
              <Route
                path="/classes/:id"
                element={
                  <PrivateRoute>
                    <Classroom />
                  </PrivateRoute>
                }
              />
              <Route
                path="/classes/:classID/mocktest/:courseId"
                element={
                  <PrivateRoute>
                    <MockTest />
                  </PrivateRoute>
                }
              />
              <Route
                path="/classes/:classID/mocktest/:mocktest_id/results"
                element={
                  <PrivateRoute>
                    <MockTestResult />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:courseId/mocktest/create"
                element={
                  <PrivateRoute>
                    <CreateMocktest />
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:courseId/mocktest"
                element={
                  <PrivateRoute>
                    <ViewMocktestCreator />
                  </PrivateRoute>
                }
              />
              <Route
                path="/forum"
                element={
                  <PrivateRoute>
                    <Forum />
                  </PrivateRoute>
                }
              />
              <Route
                path="/payment"
                element={
                  <PrivateRoute>
                    <Payment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/success"
                element={
                  <PrivateRoute>
                    <Success />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/content"
                element={
                  <PrivateRoute>
                    <Provider store={store}>
                      <AdminDashboard />
                    </Provider>
                  </PrivateRoute>
                }
              />
              <Route
                path="/courses/:courseId/edit"
                element={
                  <PrivateRoute>
                    <Provider store={store}>
                      <CourseDetails />
                    </Provider>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Sidebar>
        ) : (
          <Routes>
            <Route
              path="/home"
              element={
                <PublicRoute>
                  <Home />
                </PublicRoute>
              }
            />
            <Route
              path="/content-creator"
              element={
                <PublicRoute>
                  <ContentCreator />
                </PublicRoute>
              }
            />
            <Route
              path="/student"
              element={
                <PublicRoute>
                  <Student />
                </PublicRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <PublicRoute>
                  <Teacher />
                </PublicRoute>
              }
            />
            {/* Other routes without Sidebar */}
          </Routes>
        )}
      </div>
    );
  };

  return (
    <div>
      <Router>
        <AppContent />
      </Router>
    </div>
  );
}

export default App;
