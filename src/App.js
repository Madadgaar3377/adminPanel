import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./compontents/Navbar";
import LoginPage from "./compontents/LoginPage";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import InstallmentsAdd from "./pages/installnmentsAdd";
import InstallmentsList from "./pages/InstallmentsList";
import InstallmentsManage from "./pages/InstallmentsManage";
import InstallmentsEdit from "./pages/InstallmentsEdit";
import InstallmentApplications from "./pages/InstallmentApplications";
import InstallmentApplicationDetails from "./pages/InstallmentApplicationDetails";
import BannersList from "./pages/BannersList";
import BannersAdd from "./pages/BannersAdd";
import AgentsList from "./pages/AgentsList";
import AgentAssignments from "./pages/AgentAssignments";
import AgentAdd from "./pages/AgentAdd";
import AgentUpdate from "./pages/AgentUpdate";
import UnverifiedAgents from "./pages/UnverifiedAgents";
import Profile from "./pages/Profile";
import Partners from "./pages/Partners";
import UpdatePassword from "./pages/UpdatePassword";
import PropertyList from "./pages/PropertyList";
import PropertyAdd from "./pages/PropertyAdd";
import PropertyApplications from "./pages/PropertyApplications";
import PropertyApplicationDetails from "./pages/PropertyApplicationDetails";
import LoanAdd from "./pages/LoanAdd";
import LoanList from "./pages/LoanList";
import LoanEdit from "./pages/LoanEdit";
import LoanView from "./pages/LoanView";
import InstallmentView from "./pages/InstallmentView";
import PropertyView from "./pages/PropertyView";
import Notifications from "./pages/Notifications";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');
    if (authData) {
      try {
        const { expiry } = JSON.parse(authData);
        if (new Date().getTime() < expiry) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminAuth');
        }
      } catch (e) {
        localStorage.removeItem('adminAuth');
      }
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Navbar onLogout={handleLogout} />}

      <div className={isAuthenticated ? "max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 xs:py-8 md:py-10 safe-bottom" : ""}>
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={isAuthenticated ? <Users /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={isAuthenticated ? <Notifications /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/add"
            element={isAuthenticated ? <InstallmentsAdd /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/all"
            element={isAuthenticated ? <InstallmentsList /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/update"
            element={isAuthenticated ? <InstallmentsManage /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/edit/:id"
            element={isAuthenticated ? <InstallmentsEdit /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/view/:id"
            element={isAuthenticated ? <InstallmentView /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/all-applications"
            element={isAuthenticated ? <InstallmentApplications /> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/application/:id"
            element={isAuthenticated ? <InstallmentApplicationDetails /> : <Navigate to="/login" />}
          />

          {/* Banner Routes */}
          <Route
            path="/banner/all"
            element={isAuthenticated ? <BannersList /> : <Navigate to="/login" />}
          />
          <Route
            path="/banner/add"
            element={isAuthenticated ? <BannersAdd /> : <Navigate to="/login" />}
          />
          <Route
            path="/banner/update/:id"
            element={isAuthenticated ? <BannersAdd /> : <Navigate to="/login" />}
          />

          {/* Agent Routes */}
          <Route
            path="/agent/all"
            element={isAuthenticated ? <AgentsList /> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/assign"
            element={isAuthenticated ? <AgentAssignments /> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/add"
            element={isAuthenticated ? <AgentAdd /> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/update/:id"
            element={isAuthenticated ? <AgentUpdate /> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/unverified"
            element={isAuthenticated ? <UnverifiedAgents /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/update-password"
            element={isAuthenticated ? <UpdatePassword /> : <Navigate to="/login" />}
          />
          <Route
            path="/partners/all"
            element={isAuthenticated ? <Partners /> : <Navigate to="/login" />}
          />
          <Route
            path="/partners"
            element={isAuthenticated ? <Partners /> : <Navigate to="/login" />}
          />
          <Route
            path="/partners/update/:id"
            element={isAuthenticated ? <AgentUpdate /> : <Navigate to="/login" />}
          />

          {/* Property Routes */}
          <Route
            path="/property/all"
            element={isAuthenticated ? <PropertyList /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/add"
            element={isAuthenticated ? <PropertyAdd /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/edit/:id"
            element={isAuthenticated ? <PropertyAdd /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/view/:id"
            element={isAuthenticated ? <PropertyView /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/update"
            element={isAuthenticated ? <PropertyList /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/all-applications"
            element={isAuthenticated ? <PropertyApplications /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/application/:id"
            element={isAuthenticated ? <PropertyApplicationDetails /> : <Navigate to="/login" />}
          />
          <Route
            path="/property/view/:id"
            element={isAuthenticated ? <PropertyView /> : <Navigate to="/login" />}
          />

          {/* Loan Routes */}
          <Route
            path="/loan/all"
            element={isAuthenticated ? <LoanList /> : <Navigate to="/login" />}
          />
          <Route
            path="/loan/add"
            element={isAuthenticated ? <LoanAdd /> : <Navigate to="/login" />}
          />
          <Route
            path="/loan/view/:id"
            element={isAuthenticated ? <LoanView /> : <Navigate to="/login" />}
          />
          <Route
            path="/loan/edit/:id"
            element={isAuthenticated ? <LoanEdit /> : <Navigate to="/login" />}
          />

          {/* Catch all / Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
