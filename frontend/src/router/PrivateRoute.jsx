import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";

/**
 * PrivateRoute - Wrapper component for protected routes
 * Redirects to login if user is not authenticated
 */
function PrivateRoute({ children }) {
  const { isAuthenticated } = useSelector(selectAuth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login while saving the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;
