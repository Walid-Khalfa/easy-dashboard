import React from 'react';
import { Layout } from 'antd';
import { motion } from 'framer-motion';
import Navigation from '../Navigation';
import HeaderContent from '../HeaderContent';

const { Content } = Layout;

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0 },
};

export default function DashboardLayout({ children }) {
  return (
    <Layout style={styles.layout}>
      <Navigation />
      <Layout style={styles.mainLayout}>
        <HeaderContent />
        <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
          <Content style={styles.content}>{children}</Content>
        </motion.div>
      </Layout>
    </Layout>
  );
}

const styles = {
  layout: {
    minHeight: '100vh',
    background: '#0D0D0D',
  },
  mainLayout: {
    marginLeft: 260,
    minHeight: '100vh',
    background: '#0D0D0D',
    transition: 'margin-left 0.3s ease',
  },
  content: {
    padding: '30px 40px',
    margin: '20px auto',
    width: '100%',
    maxWidth: '1100px',
  },
};
