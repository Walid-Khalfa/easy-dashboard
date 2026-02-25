import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { login } from '@/redux/auth/actions';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '@/redux/auth/selectors';
import { useNavigate, useLocation } from 'react-router-dom';

const { Content, Footer } = Layout;

const pageVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0 },
};

const cardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: i => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading: isLoading, isAuthenticated, error } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      message.error(error.message || 'Login failed');
    }
  }, [error]);

  const onFinish = values => {
    dispatch(login(values));
  };

  return (
    <Layout className="layout" style={styles.layout}>
      <div style={styles.background}>
        <div style={styles.gradientOrb1} />
        <div style={styles.gradientOrb2} />
        <div style={styles.noiseOverlay} />
      </div>

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ width: '100%' }}
      >
        <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: '40px 20px' }}>
          <Col xs={22} sm={20} md={16} lg={12} xl={10}>
            <motion.div variants={cardVariants} style={styles.card}>
              <Content style={styles.content}>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  style={styles.header}
                >
                  <h1 style={styles.title}>Welcome Back</h1>
                  <p style={styles.subtitle}>Sign in to your dashboard</p>
                </motion.div>

                <Divider style={styles.divider} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Form
                    form={form}
                    name="normal_login"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                  >
                    <motion.div
                      custom={0}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Form.Item
                        name="email"
                        rules={[
                          { required: true, message: 'Please input your Email!' },
                          { type: 'email', message: 'Please input a valid email!' },
                        ]}
                        style={{ marginBottom: 24 }}
                      >
                        <Input
                          prefix={<UserOutlined style={styles.inputIcon} />}
                          placeholder="admin@demo.com"
                          autoComplete="off"
                          size="large"
                          style={styles.input}
                        />
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      custom={1}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                        style={{ marginBottom: 20 }}
                      >
                        <Input
                          prefix={<LockOutlined style={styles.inputIcon} />}
                          type="password"
                          placeholder="123456"
                          autoComplete="off"
                          size="large"
                          style={styles.input}
                        />
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      custom={2}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Form.Item style={{ marginBottom: 16 }}>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                          <Checkbox style={styles.checkbox}>Remember me</Checkbox>
                        </Form.Item>
                        <a className="login-form-forgot" href="" style={styles.forgotLink}>
                          Forgot password
                        </a>
                      </Form.Item>
                    </motion.div>

                    <motion.div
                      custom={3}
                      variants={itemVariants}
                      initial="initial"
                      animate="animate"
                    >
                      <Form.Item style={{ marginTop: 24, marginBottom: 12 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          className="login-form-button"
                          loading={isLoading}
                          size="large"
                          block
                          style={styles.submitButton}
                        >
                          Sign In
                        </Button>
                      </Form.Item>
                    </motion.div>
                  </Form>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  style={styles.registerText}
                >
                  Don't have an account?{' '}
                  <a href="" style={styles.registerLink}>
                    Create one
                  </a>
                </motion.p>
              </Content>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              style={styles.footer}
            >
              Easy-Dashboard Pro &copy; 2026
            </motion.p>
          </Col>
        </Row>
      </motion.div>
    </Layout>
  );
};

const styles = {
  layout: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
  },
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    background: '#0D0D0D',
  },
  gradientOrb1: {
    position: 'absolute',
    top: '-20%',
    left: '-10%',
    width: '60%',
    height: '60%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212, 168, 83, 0.15) 0%, transparent 70%)',
    filter: 'blur(60px)',
  },
  gradientOrb2: {
    position: 'absolute',
    bottom: '-30%',
    right: '-20%',
    width: '70%',
    height: '70%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(100, 80, 180, 0.12) 0%, transparent 70%)',
    filter: 'blur(80px)',
  },
  noiseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  },
  card: {
    background: 'rgba(22, 22, 22, 0.7)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '24px',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  content: {
    padding: '48px 40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 32,
    fontWeight: 600,
    color: '#FAFAFA',
    marginBottom: 8,
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: 15,
    color: '#A3A3A3',
    margin: 0,
  },
  divider: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    margin: '32px 0',
  },
  input: {
    height: 52,
    background: 'rgba(31, 31, 31, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontSize: 15,
  },
  inputIcon: {
    color: '#6B6B6B',
    fontSize: 18,
  },
  checkbox: {
    color: '#A3A3A3',
  },
  forgotLink: {
    color: '#D4A853',
    fontSize: 14,
    float: 'right',
    transition: 'color 0.2s ease',
  },
  submitButton: {
    height: 52,
    fontSize: 16,
    fontWeight: 600,
    background: 'linear-gradient(135deg, #D4A853 0%, #E8C87A 100%)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(212, 168, 83, 0.3)',
    transition: 'all 0.3s ease',
  },
  registerText: {
    textAlign: 'center',
    color: '#6B6B6B',
    fontSize: 14,
    marginTop: 24,
  },
  registerLink: {
    color: '#D4A853',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  },
  footer: {
    textAlign: 'center',
    color: '#4A4A4A',
    fontSize: 13,
    marginTop: 24,
  },
};

export default LoginPage;
