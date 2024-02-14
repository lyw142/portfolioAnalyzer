import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Form, Input, message } from 'antd';

import logo from '../../../assets/logo.png';
import Loading from '../../Loading/Loading';
import { notify } from '../../../utils/notify';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const { Header } = Layout;

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onSendTempPasswordClick = async (values) => {
        try {
            setIsLoading(true);

            // TODO: Send Temporary Password logic here
            
            // insert temp password generation logic here
            // simulated first
            

            const bodyParams = {
                email: values.email,
                forgot: true,

            };            
            const email = values.email;
            const changeUserPasswordURL = 'http://localhost:8080/forgetPassword/' + email;
            const response = await axios.put(changeUserPasswordURL, bodyParams);
            if (response.status === 200) {
                console.log('Password reset successfully');
                setErrorMessage('');
            }else if (response.status === 403) {
                setErrorMessage(response.data);

            }
            setTimeout(() => {
                notify('success', 'Password reset. Temporary Password has been sent to your email.');
                navigate("/login");
            }, 500);

        } catch (err) {
            setErrorMessage(err.response.data);
            notify('error', 'Failed to send temporary password');
            
        } finally {
            setIsLoading(false);
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


    if (isLoading) return <Loading />;
    
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
                <ToastContainer />
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
                <ToastContainer />
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
                            <h2>Forgot Password</h2>
                        </div>
                        <Form
                            name="forget-password-form"
                            autoComplete="off"
                            onFinish={onSendTempPasswordClick}
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
                            <Form.Item>
                                <Button
                                    htmlType="submit"
                                    size='large'
                                    type="primary"
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    Send Temporary Password
                                </Button>
                                <div style={{
                                    margin: '12px 0',
                                    textAlign: 'center'
                                }}>Return to
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
                </div>
            </Layout>
        </Layout>
    );
};

export default ForgotPassword;