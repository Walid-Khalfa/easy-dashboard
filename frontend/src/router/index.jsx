// export { default as AuthRouter } from "./AuthRouter";
// export { default as AppRouter } from "./AppRouter";
import React, { useEffect } from "react";

import AuthRouter from "./AuthRouter";
import AppRouter from "./AppRouter";

import { Layout } from "antd";
import Navigation from "@/layout/Navigation";

import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";

export default function Router() {
  const { isAuthenticated, isLoggedIn } = useSelector(selectAuth);

  useEffect(() => {
    console.log("isAuthenticated : ", isAuthenticated);
  }, [isAuthenticated]);

  // Show loading or redirect based on auth state
  // If not authenticated, show login (AuthRouter)
  if (!isAuthenticated && !isLoggedIn)
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AuthRouter />
      </Layout>
    );
  
  // If authenticated, show main app with navigation
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navigation />
      <Layout style={{ minHeight: "100vh" }}>
        <AppRouter />
      </Layout>
    </Layout>
  );
}

// export default App;
