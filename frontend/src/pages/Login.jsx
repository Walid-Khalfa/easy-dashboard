import React, { useEffect } from "react";

import { Form, Input, Button, Checkbox, Layout, Row, Col, Divider, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

import { login } from "@/redux/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "@/redux/auth/selectors";
import { useNavigate } from "react-router-dom";
const { Content, Footer } = Layout;

const LoginPage = () => {
  const navigate = useNavigate();
  const { loading: isLoading, isAuthenticated, error } = useSelector(selectAuth);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Show error message if there's an error
    if (error) {
      message.error(error.message || 'Login failed');
    }
  }, [error]);

  const onFinish = (values) => {
    dispatch(login(values));
  };
  return (
    <>
      <Layout className="layout">
        <Row>
          <Col span={12} offset={6}>
            <Content
              style={{
                padding: "150px 0 180px",
                maxWidth: "360px",
                margin: "0 auto",
              }}
            >
              <h1>Login</h1>
              <Divider />
              <div className="site-layout-content">
                {" "}
                <Form
                  form={form}
                  name="normal_login"
                  className="login-form"
                  initialValues={{
                    remember: true,
                  }}
                  onFinish={onFinish}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Email!",
                      },
                      {
                        type: 'email',
                        message: "Please input a valid email!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined className="site-form-item-icon" />}
                      placeholder="admin@demo.com"
                      autoComplete="off"
                    />
                  </Form.Item>
                  <Form.Item
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please input your Password!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<LockOutlined className="site-form-item-icon" />}
                      type="password"
                      placeholder="123456"
                      autoComplete="off"
                    />
                  </Form.Item>
                  <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <a className="login-form-forgot" href="">
                      Forgot password
                    </a>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      className="login-form-button"
                      loading={isLoading}
                    >
                      Log in
                    </Button>
                    Or <a href="">register now!</a>
                  </Form.Item>
                </Form>
              </div>
            </Content>
          </Col>
        </Row>

        <Footer style={{ textAlign: "center" }}>
          Open Source CRM based on AntD & React ©2020 Created by Salah Eddine
          Lalami
        </Footer>
      </Layout>
    </>
  );
};

export default LoginPage;
