import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Form, Input } from 'antd';

import logo from '../../../assets/logo.png';

import axios from 'axios';
import { notify } from '../../../utils/notify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Header } = Layout;

const SignUp = () => {
    const [errorMessage, setErrorMessage] = useState('');
    // const [validEMail, setValidEmail] = useState(false);
    // const [validPass, setValidPass] = useState(false);

    const navigate = useNavigate();

    const onSignUpClick = async (values) => {
        try {
            const bodyParams = {
                email: values.email,
                password: values.password
            };

            const signUpURL = 'http://localhost:8080/addUser';
            const response = await axios.post(signUpURL, bodyParams);
            console.log('signupresponse', response);
            if (response.status === 201) {
                // navigate("/");
                setErrorMessage('');
                navigate(`/login`);
            }
            else if (response.status === 400) {
                console.log(response.data);
                setErrorMessage(response.data);
            } else {
                notify('error', 'Unexpected error');
                return;
            }

            notify('success', 'Successfully created! Navigating to Login...');
            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            if (err.response.status === 400) {
                console.log(err.response.data);
                setErrorMessage(err.response.data);
            } else {
                notify('error', 'Unexpected error');
                setErrorMessage('Unexpected error');
            }
        }
    };

    useEffect(() => {
        // This code runs after the component has rendered.
        // Access the errorDiv element and set its text content.
        const errorDiv = document.getElementById('errorDiv');
        if (errorDiv) {
            errorDiv.textContent = errorMessage;
        }
    }, [errorMessage]); // Run when errorMessage changes

    return (
        <Layout>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    position: 'fixed',
                    width: '100%',
                    zIndex: 9
                }}
            >
                <ToastContainer style={{ width: "400px" }} />
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                        background: 'white',
                    }}>

                    <div style={{
                        display: 'flex',
                    }}>
                        <img src={logo} height={35} alt='logo' />
                    </div>
                </div>
            </Header>

            <Layout
                style={{
                    marginTop: '50px',
                    background: 'white',
                }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        height: '800px',
                    }}
                >
                    <Card style={{
                        padding: '12px',
                        margin: '12px',
                        minWidth: 340
                    }}>
                        <div style={{
                            margin: '8px auto 24px',
                            textAlign: 'center'
                        }}>
                            <h2>Account Registration</h2>
                        </div>
                        <Form
                            name="signup"
                            autoComplete="off"
                            onFinish={onSignUpClick}
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input an email',
                                    },
                                ]}
                            >
                                <Input
                                    size='large'
                                    placeholder='Email'
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input a password!',
                                    }
                                ]}
                            >
                                <Input.Password
                                    size='large'
                                    placeholder='Password'
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    htmlType="submit"

                                    size='large'
                                    type="primary"
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    Sign Up
                                </Button>
                                <div style={{
                                    margin: '12px 0',
                                    textAlign: 'center'
                                }}>Already have an account?
                                    <Link to={'/login'}>
                                        {' '}Login
                                    </Link>
                                </div>
                            </Form.Item>
                        </Form>
                        {errorMessage && <div id="errorDiv" style={{
                            margin: '12px 0',
                            textAlign: 'center',
                            color: 'red',
                            fontWeight: 'bold',
                        }}>
                        </div>}
                    </Card>
                </div >
            </Layout>
        </Layout>
    );
};

export default SignUp;