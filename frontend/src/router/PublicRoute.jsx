import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";

/**
 * PublicRoute - Wrapper component for public routes
 * Redirects authenticated users away from login page
 */
function PublicRoute({ children }) {
  const { isAuthenticated } = useSelector(selectAuth);
  const location = useLocation();

  // If user is authenticated, redirect to the page they came from or home
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
}

export default PublicRoute;
