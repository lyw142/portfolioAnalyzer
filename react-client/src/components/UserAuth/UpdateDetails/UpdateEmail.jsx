import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Card, Form, Input, message } from 'antd';

import logo from '../../../assets/logo.png';
import Loading from '../../Loading/Loading';
import { notify } from '../../../utils/notify';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';


const { Header } = Layout;

const UpdateEmail = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!Cookies.get('email')) {
        console.log('Unauthenticated User, please login')
        navigate('/login');
        } else {
            console.log('Authenticated User')
        }

        if (Cookies.get('isTempPassword')) {
            notify('Logged in with temporary password. Please change your password');
            setTimeout(() => {
                navigate("/changePassword");
            }, 1000);
        }
    }, []);

    useEffect(() => {
        const errorDiv = document.getElementById('errorDiv');
        errorDiv.textContent = errorMessage;
    }, [errorMessage]); // Run this code when errorMessage changes

    const onUpdateEmailClick = async (values) => {
        try {
            setIsLoading(true);
            // TODO Update Email logic here

            const bodyParams = {
                // email: values.email,
                email: Cookies.get('email'),
                newEmail: values.newEmail,
            };
            console.log('bodyParams', bodyParams);
            
            // const updateEmailURL = 'http://localhost:8080/updateUserEmail/' + values.email + '?newEmail=' + values.newEmail;
            const email = Cookies.get('email');
            const updateEmailURL = 'http://localhost:8080/updateUserEmail/' + email + '?newEmail=' + values.newEmail; // Retrieves email directly from account, rather than from form

            const response = await axios.put(updateEmailURL, bodyParams);
            console.log('updateEmailResponse', response);
            if (response.status === 200) {
                Cookies.set('email', values.newEmail);
                setErrorMessage = '';
                navigate('/');
                notify('success', 'Email updated');
            }
        } catch (err) {
            if (err.response.status === 403) {
                console.log('Email already exists. Choose another email or login with your existing account')
                notify('error', 'Email already exists. Choose another email or login with your existing account');
                // setErrorMessage("Email already exists. Choose another email or login with your existing account")
                setErrorMessage(err.response.data); // Use the error message from the backend
            } else if (err.response.status === 400) {
                console.log('Invalid email')
                notify('error', 'Invalid email');
                // setErrorMessage("Invalid email") // Use the error message from the backend
                setErrorMessage(err.response.data);
            } else {
                notify('error', 'Unexpected error');
                setErrorMessage('Unexpected error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Loading />;
    return (
        <>
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
                <ToastContainer />
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
                                <h2>Update Email</h2>
                            </div>
                            <Form
                                name="update-email-form"
                                autoComplete="off"
                                onFinish={onUpdateEmailClick}
                            >
                                {/* <Form.Item
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
                                </Form.Item> */}

                                <Form.Item
                                    name="newEmail"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input a new email!',
                                        }
                                    ]}
                                >
                                    <Input
                                        size='large'
                                        placeholder='New Email'
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
                                        Update Email
                                    </Button>
                                    <div style={{
                                        margin: '12px 0',
                                        textAlign: 'center'
                                    }}>Return to
                                        <Link to={'/profile'}>
                                            {' '}Profile
                                        </Link>
                                    </div>
                                </Form.Item>
                            </Form>
                            <div id="errorDiv" style={{
                            margin: '12px 0',
                            textAlign: 'center',
                            color: 'red',
                            fontWeight: 'bold',
                            }}>
                            </div>
                        </Card>
                    </div>
                </Layout>
            </Layout>

        </>

    );
};
export default UpdateEmail;