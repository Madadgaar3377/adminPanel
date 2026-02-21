import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "./compontents/SidebarContext";
import Layout from "./compontents/Layout";
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
import OfferItems from "./pages/OfferItems";
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
import BlogList from "./pages/BlogList";
import BlogAdd from "./pages/BlogAdd";
import BlogView from "./pages/BlogView";
import CommissionRulesList from "./pages/CommissionRulesList";
import CasesManagement from "./pages/CasesManagement";
import CommissionManagement from "./pages/CommissionManagement";
import SystemHealth from "./pages/SystemHealth";
import TaxSettings from "./pages/TaxSettings";
import AdminChat from "./pages/AdminChat";
import BulkEmail from "./pages/BulkEmail";
import InsurancePlansList from "./pages/InsurancePlansList";
import InsuranceApplicationsList from "./pages/InsuranceApplicationsList";
import InsuranceApplicationDetails from "./pages/InsuranceApplicationDetails";
import InsuranceClaimsList from "./pages/InsuranceClaimsList";
import InsurancePlanAdd from "./pages/InsurancePlanAdd";
import AgentWithdrawals from "./pages/AgentWithdrawals";

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
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Route */}
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><Dashboard /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><Users /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><Notifications /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/bulk-email"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BulkEmail /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentsAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentsList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/update"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentsManage /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/edit/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentsEdit /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/view/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentView /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/all-applications"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentApplications /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/installments/application/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InstallmentApplicationDetails /></Layout> : <Navigate to="/login" />}
          />

          {/* Banner Routes */}
          <Route
            path="/banner/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BannersList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/banner/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BannersAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/banner/update/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BannersAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/offer-items"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><OfferItems /></Layout> : <Navigate to="/login" />}
          />

          {/* Agent Routes */}
          <Route
            path="/agent/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AgentsList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/assign"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AgentAssignments /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AgentAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/update/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AgentUpdate /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/unverified"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><UnverifiedAgents /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/agent/withdrawals"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AgentWithdrawals /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><Profile /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/update-password"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><UpdatePassword /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/partners/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><Partners /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/partners"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><Partners /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/partners/update/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AgentUpdate /></Layout> : <Navigate to="/login" />}
          />

          {/* Property Routes */}
          <Route
            path="/property/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/property/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/property/edit/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/property/view/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyView /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/property/update"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/property/all-applications"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyApplications /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/property/application/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><PropertyApplicationDetails /></Layout> : <Navigate to="/login" />}
          />

          {/* Loan Routes */}
          <Route
            path="/loan/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><LoanList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/loan/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><LoanAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/loan/view/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><LoanView /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/loan/edit/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><LoanEdit /></Layout> : <Navigate to="/login" />}
          />

          {/* Blog Routes */}
          <Route
            path="/blog/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BlogList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/blog/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BlogAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/blog/edit/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BlogAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/blog/view/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><BlogView /></Layout> : <Navigate to="/login" />}
          />

          {/* Commission & Cases Routes */}
          <Route
            path="/commission/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><CommissionRulesList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/commission/management"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><CommissionManagement /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/cases/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><CasesManagement /></Layout> : <Navigate to="/login" />}
          />

          {/* Insurance Routes */}
          <Route
            path="/insurance/all"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InsurancePlansList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/insurance/add"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InsurancePlanAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/insurance/edit/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InsurancePlanAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/insurance/view/:id"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InsurancePlanAdd /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/insurance/applications"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InsuranceApplicationsList /></Layout> : <Navigate to="/login" />}
          />
          <Route
            path="/insurance/application/:id"
            element={isAuthenticated ? <InsuranceApplicationDetails onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/insurance/claims"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><InsuranceClaimsList /></Layout> : <Navigate to="/login" />}
          />

          {/* Chat Route */}
          <Route
            path="/chat"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><AdminChat /></Layout> : <Navigate to="/login" />}
          />

          {/* System Health Route */}
          <Route
            path="/system/health"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><SystemHealth /></Layout> : <Navigate to="/login" />}
          />

          {/* Tax Settings Route */}
          <Route
            path="/system/tax-settings"
            element={isAuthenticated ? <Layout onLogout={handleLogout}><TaxSettings /></Layout> : <Navigate to="/login" />}
          />

          {/* Catch all / Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </div>
    </SidebarProvider>
  );
}

export default App;
