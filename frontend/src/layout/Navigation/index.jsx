import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SettingOutlined,
  UserOutlined,
  CustomerServiceOutlined,
  FileTextOutlined,
  FileSyncOutlined,
  DashboardOutlined,
  TeamOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

function Navigation() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const onCollapse = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/customer',
      icon: <CustomerServiceOutlined />,
      label: <Link to="/customer">Customers</Link>,
    },
    {
      key: '/selectcustomer',
      icon: <UserOutlined />,
      label: <Link to="/selectcustomer">Select Customer</Link>,
    },
    {
      key: '/lead',
      icon: <FileTextOutlined />,
      label: <Link to="/lead">Leads</Link>,
    },
    {
      key: '/product',
      icon: <FileSyncOutlined />,
      label: <Link to="/product">Products</Link>,
    },
    {
      key: '/admin',
      icon: <TeamOutlined />,
      label: <Link to="/admin">Admins</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    const matchingItem = menuItems.find(item => item.key === path);
    return matchingItem ? [matchingItem.key] : ['/'];
  };

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={onCollapse}
        style={styles.sider}
        trigger={null}
        width={260}
        collapsedWidth={80}
      >
        <div style={styles.logoContainer}>
          <motion.div
            style={styles.logo}
            animate={{ width: collapsed ? 48 : 180 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {collapsed ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={styles.logoIcon}
              >
                E
              </motion.span>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={styles.logoText}
              >
                EasyDashboard
              </motion.span>
            )}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={styles.logoSubtitle}
            >
              <span style={styles.subtitleText}>CRM System</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          style={styles.menu}
        />
      </Sider>

      <motion.div
        style={{ ...styles.collapseButton, left: collapsed ? 64 : 244 }}
        onClick={onCollapse}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {collapsed ? (
          <span style={styles.collapseIcon}>›</span>
        ) : (
          <span style={styles.collapseIcon}>‹</span>
        )}
      </motion.div>
    </>
  );
}

const styles = {
  sider: {
    background: 'rgba(13, 13, 13, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    minHeight: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  logoContainer: {
    padding: '24px 20px 16px',
    display: 'flex',
    justifyContent: 'center',
  },
  logo: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoIcon: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 28,
    fontWeight: 700,
    color: '#D4A853',
    textShadow: '0 0 30px rgba(212, 168, 83, 0.5)',
  },
  logoText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#FAFAFA',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.02em',
  },
  logoSubtitle: {
    textAlign: 'center',
    paddingBottom: 16,
    overflow: 'hidden',
  },
  subtitleText: {
    fontSize: 11,
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
  },
  menu: {
    background: 'transparent',
    borderRight: 'none',
    padding: '8px 12px',
    fontSize: 14,
  },
  collapseButton: {
    position: 'fixed',
    bottom: 24,
    width: 32,
    height: 32,
    background: 'rgba(212, 168, 83, 0.15)',
    border: '1px solid rgba(212, 168, 83, 0.3)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 101,
    transition: 'left 0.3s ease',
  },
  collapseIcon: {
    color: '#D4A853',
    fontSize: 18,
    fontWeight: 600,
    lineHeight: 1,
  },
};

export default Navigation;
