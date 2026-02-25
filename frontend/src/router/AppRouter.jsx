import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import PageLoader from "@/components/PageLoader";

const Dashboard = lazy(() =>
  import(/*webpackChunkName:'DashboardPage'*/ "@/pages/Dashboard")
);
const Admin = lazy(() =>
  import(/*webpackChunkName:'AdminPage'*/ "@/pages/Admin")
);

const Customer = lazy(() =>
  import(/*webpackChunkName:'CustomerPage'*/ "@/pages/Customer")
);

const SelectCustomer = lazy(() =>
  import(/*webpackChunkName:'SelectCustomerPage'*/ "@/pages/SelectCustomer")
);

const Lead = lazy(() => import(/*webpackChunkName:'LeadPage'*/ "@/pages/Lead"));
const Product = lazy(() =>
  import(/*webpackChunkName:'ProductPage'*/ "@/pages/Product")
);

const Logout = lazy(() =>
  import(/*webpackChunkName:'LogoutPage'*/ "@/pages/Logout")
);
const NotFound = lazy(() =>
  import(/*webpackChunkName:'NotFoundPage'*/ "@/pages/NotFound")
);

export default function AppRouter() {
  const location = useLocation();
  
  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/customer" 
            element={
              <PrivateRoute>
                <Customer />
              </PrivateRoute>
            } 
          />
          <Route
            path="/selectcustomer"
            element={
              <PrivateRoute>
                <SelectCustomer />
              </PrivateRoute>
            }
          />
          <Route 
            path="/lead" 
            element={
              <PrivateRoute>
                <Lead />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/product" 
            element={
              <PrivateRoute>
                <Product />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/logout" 
            element={
              <PrivateRoute>
                <Logout />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Navigate to="/" replace />
              </PublicRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
