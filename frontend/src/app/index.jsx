import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import store from '@/redux/store';

import Router from '@/router';
import useNetwork from '@/hooks/useNetwork';
import { checkAuthStatus } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';
import { Button, Result } from 'antd';

// Inner component that uses Redux hooks - must be inside Provider
function AppContent() {
  const { isOnline: isNetwork } = useNetwork();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector(selectAuth);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check auth status on app initialization
    const initAuth = async () => {
      try {
        await dispatch(checkAuthStatus());
      } catch (error) {
        // Auth check failed, user will remain unauthenticated
        console.log('Auth check failed:', error);
      }
      setInitialized(true);
    };
    initAuth();
  }, [dispatch]);

  // Show loading while checking auth
  if (!initialized || isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isNetwork) {
    return (
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
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#D4A853',
          colorBgBase: '#0D0D0D',
          colorBgContainer: '#161616',
          colorBgElevated: '#1F1F1F',
          colorText: '#FAFAFA',
          colorTextSecondary: '#A3A3A3',
          colorBorder: 'rgba(255, 255, 255, 0.08)',
          colorBorderSecondary: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 12,
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        },
        components: {
          Button: {
            primaryShadow: '0 4px 20px rgba(212, 168, 83, 0.3)',
            controlHeight: 44,
          },
          Input: {
            activeBorderColor: '#D4A853',
            hoverBorderColor: '#D4A853',
          },
          Table: {
            headerBg: '#1F1F1F',
            headerColor: '#A3A3A3',
            rowHoverBg: '#1F1F1F',
          },
          Card: {
            colorBgContainer: '#161616',
          },
          Modal: {
            contentBg: '#161616',
            headerBg: '#161616',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
          },
        },
      }}
    >
      <Router />
    </ConfigProvider>
  );
}

// Root component with Provider at the top level
function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
