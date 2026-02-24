import React, { useEffect, useState, Suspense } from "react";
import { Router as RouterHistory } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import Router from "@/router";
import history from "@/utils/history";
import store from "@/redux/store";

import { Button, Result, ConfigProvider } from "antd";

import useNetwork from "@/hooks/useNetwork";
import { checkAuthStatus } from "@/redux/auth/actions";
import { selectAuth } from "@/redux/auth/selectors";

function AppContent() {
  const { isOnline: isNetwork } = useNetwork();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(selectAuth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check auth status on app initialization
    const initAuth = async () => {
      await dispatch(checkAuthStatus());
      setInitialized(true);
    };
    initAuth();
  }, [dispatch]);

  // Show loading while checking auth
  if (!initialized || isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isNetwork)
    return (
      <>
        <Result
          status="404"
          title="No Internet Connection"
          subTitle="Check your Internet Connection or your network."
          extra={
            <Button href="/" type="primary">
              Try Again
            </Button>
          }
        />
      </>
    );
  else {
    return (
      <RouterHistory history={history}>
        <Provider store={store}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1DA57A',
              },
            }}
          >
            <Router />
          </ConfigProvider>
        </Provider>
      </RouterHistory>
    );
  }
}

function App() {
  return <AppContent />;
}

export default App;
