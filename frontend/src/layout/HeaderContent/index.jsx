import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Layout, Avatar, Menu, Dropdown, Space } from 'antd';
import { motion } from 'framer-motion';
import { UserOutlined, LogoutOutlined, SettingOutlined, BellOutlined } from '@ant-design/icons';
import { logout } from '@/redux/auth/actions';
import { selectAuth } from '@/redux/auth/selectors';

const { Header } = Layout;

export default function HeaderContent() {
  const dispatch = useDispatch();
  const { admin } = useSelector(selectAuth);

  const menu = (
    <Menu style={styles.dropdownMenu}>
      <Menu.Item key="profile" style={styles.dropdownItem}>
        <UserOutlined style={styles.dropdownIcon} />
        <span>Profile</span>
      </Menu.Item>
      <Menu.Item key="settings" style={styles.dropdownItem}>
        <SettingOutlined style={styles.dropdownIcon} />
        <span>Settings</span>
      </Menu.Item>
      <Menu.Divider style={styles.dropdownDivider} />
      <Menu.Item key="logout" onClick={() => dispatch(logout())} style={styles.dropdownItem}>
        <LogoutOutlined style={{ ...styles.dropdownIcon, color: '#F87171' }} />
        <span style={{ color: '#F87171' }}>Logout</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.leftSection}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            style={styles.breadcrumb}
          >
            <span style={styles.breadcrumbText}>Dashboard</span>
          </motion.div>
        </div>

        <div style={styles.rightSection}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={styles.iconButton}
          >
            <BellOutlined style={styles.headerIcon} />
            <span style={styles.notificationBadge}>3</span>
          </motion.div>

          <Dropdown overlay={menu} placement="bottomRight" arrow trigger={['click']}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              style={styles.userSection}
            >
              <Avatar style={styles.avatar} icon={<UserOutlined />} />
              <div style={styles.userInfo}>
                <span style={styles.userName}>{admin?.name || 'Admin'}</span>
                <span style={styles.userRole}>Administrator</span>
              </div>
            </motion.div>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
}

const styles = {
  header: {
    background: 'rgba(13, 13, 13, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    padding: 0,
    position: 'sticky',
    top: 0,
    zIndex: 99,
    height: 72,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    padding: '0 32px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 22,
    fontWeight: 600,
    color: '#FAFAFA',
    letterSpacing: '-0.02em',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  headerIcon: {
    fontSize: 18,
    color: '#A3A3A3',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#F87171',
    color: '#fff',
    fontSize: 10,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 16px 8px 8px',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  avatar: {
    background: 'linear-gradient(135deg, #D4A853 0%, #E8C87A 100%)',
    width: 40,
    height: 40,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#FAFAFA',
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 1.2,
  },
  dropdownMenu: {
    background: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: '8px',
    minWidth: 180,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    color: '#FAFAFA',
    fontSize: 14,
    transition: 'all 0.15s ease',
  },
  dropdownIcon: {
    fontSize: 16,
    color: '#A3A3A3',
  },
  dropdownDivider: {
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '8px 0',
  },
};
