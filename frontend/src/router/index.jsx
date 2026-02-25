import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import { useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";

import AppRouter from "./AppRouter";
import AuthRouter from "./AuthRouter";
import Navigation from "@/layout/Navigation";

export default function Router() {
  const { isAuthenticated, isLoggedIn } = useSelector(selectAuth);

  // If not authenticated, show login (AuthRouter)
  if (!isAuthenticated && !isLoggedIn) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AuthRouter />
      </Layout>
    );
  }

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
