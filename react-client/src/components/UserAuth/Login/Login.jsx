import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Form, Input } from 'antd';

import logo from '../../../assets/logo.png';
import Loading from '../../Loading/Loading';

import axios from 'axios';
import Cookies from 'js-cookie';

import { notify } from '../../../utils/notify';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const { Header } = Layout;

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();
    const setCookie = (name, value) => {
        Cookies.set(name, value, { expires: 7, path: '/' });
    }

    const onLoginClick = async (values) => {
        try {
            setIsLoading(true);

            // TODO: Login logic here
            const bodyParams = {
                email: values.email,
                password: values.password
            };
            console.log('bodyParams', bodyParams);

            // console.log('bodyParams', bodyParams); // Works

            const loginURL = 'http://localhost:8080/login';
            const response = await axios.post(loginURL, bodyParams);
            console.log('loginResponse', response);

            if (response.status === 200) {
                // navigate("/");
                // console.log("response.data: "+ response.data)

                const adminResponse = "Admin Login Successful" // This is the response received when an admin logs in

                if (response.data == adminResponse) {
                    setCookie('isAdmin', true)
                    console.log("isAdmin cookie: " + Cookies.get('isAdmin') + " set");
                }

                setErrorMessage(''); // Reset error message
                navigate(`/?email=${values.email}`); // Email will be passed in as a query parameter. Access through the URL
                setCookie('email', values.email) // Set cookie for email to be retrieved by other pages
                
                console.log("email cookie: " + Cookies.get('email') + " set"); 
            }
            else if (response.status == 202) { // This response is received if user logs in with a temporary password
                setErrorMessage(''); // Reset error message
                navigate(`/?email=${values.email}`); // Email will be passed in as a query parameter. Access through the URL
                setCookie('email', values.email) // Set cookie for email to be retrieved by other pages
                setCookie('isTempPassword', true) // Set cookie to indicate password needs to be reset

                notify('Logged in with temporary password. Please change your password');
                navigate('/changePassword');
            }
            else if (response.status === 401) {
                notify('error', 'Wrong Password');
            }
            else if (response.status === 403) {
                notify('error', 'No such account exists');
            } else {
                notify('error', 'Unexpected error');
            }
        } catch (err) {
            console.log(err.response.status);

            if (err.response.status === 401) {
                notify('error', 'Wrong Password');
                setErrorMessage('Wrong Password');
            } else if (err.response.status === 403) {
                notify('error', 'No such account exists');
                setErrorMessage('No such account');
            } else {
                notify('error', 'Unexpected error');
                setErrorMessage('Unexpected error');
            }
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
    
    // The line for isLoading below must be before the return statement and after the onLoginClick function
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '800px',
                        flexDirection: 'column'
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
                            <h2>Log In</h2>
                        </div>
                        <Form
                            name="login-form"
                            autoComplete="off"
                            onFinish={onLoginClick}
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your email',
                                    },
                                ]}
                            >
                                <Input
                                    placeholder='Email'
                                    size='large'
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your password!',
                                    }
                                ]}
                            >
                                <Input.Password
                                    size='large'
                                    placeholder='Password' />
                            </Form.Item>
                            <div style={{
                                textAlign: 'end',
                                margin: '4px 0 12px'
                            }}>
                                <Link to={'/forgotPassword'}>
                                    Forgot Password?
                                </Link>
                            </div>
                            <Form.Item>
                                <Button
                                    htmlType="submit"
                                    size='large'
                                    type="primary"
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    Login
                                </Button>
                                <div style={{
                                    margin: '12px 0',
                                    textAlign: 'center'
                                }}>Don't have an account?
                                    <Link to={'/signup'}>
                                        {' '}Register
                                    </Link>
                                </div>
                            </Form.Item>
                        </Form>
                        {errorMessage && <div id="errorDiv" style={{ 
                                    margin: '12px 0',
                                    textAlign: 'center',
                                    color: 'red',
                                    fontWeight: 'bold',
                                    // display: 'none'
                                }}>
                        </div>}
                    </Card>

                </div>
            </Layout>
        </Layout >
    );
};


export default Login;