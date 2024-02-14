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

const ChangePassword = () => {
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
    }, []);

    useEffect(() => { 
        // This code runs after the component has rendered.
        // Access the errorDiv element and set its text content.
        const errorMessage = "Logged in with temporary password. Please reset now."
        const errorDiv = document.getElementById('errorDiv');
        console.log(Cookies.get('isTempPassword'))
        console.log(Cookies.valueOf());
        
        if (Cookies.get('isTempPassword') == false || Cookies.get('isTempPassword') == undefined) {
                    errorDiv.textContent = '';
        } else {
                setErrorMessage(errorMessage);
        }
    }, []); 

    useEffect(() => {
        const errorDiv = document.getElementById('errorDiv');
        errorDiv.textContent = errorMessage;
    }, [errorMessage]); // Run this code when errorMessage changes
    const onChangePasswordClick = async (values) => {
        const errorMessage = "Failed to add. Invalid password.";
        const errorDiv = document.getElementById('errorDiv');
        try {
            setIsLoading(true);
            

            // TODO: Change Password logic here
            const bodyParams = {
                // email: values.email,
                password: values.newPassword,
                email: Cookies.get('email'),
                forgot: false,
            };
            console.log('bodyParams', bodyParams);

            // let email = values.email; // no longer using form input for email
            let newPassword = values.newPassword;
            let newPassword2 = values.newPassword2;

            if (newPassword != newPassword2) {
                console.log("Passwords do not match")
                throw new Error('Passwords do not match');
            }

            const email = Cookies.get('email'); // retrieving email directly from account, rather than from form
            // const changeUserPasswordURL = 'http://localhost:8080/changeUserPassword/' + email + '?newPassword=' + newPassword;
            const changeUserPasswordURL = 'http://localhost:8080/changeUserPassword/' + email;
            const response = await axios.put(changeUserPasswordURL, bodyParams);
            console.log('changePasswordResponse', response);
            if (response.status === 201) {
                console.log(Cookies);
                console.log('Password changed successfully')
                Cookies.set('isTempPassword', false);
                Cookies.remove('isTempPassword');
                notify('success', 'Password has been changed!');
                navigate('/')
            }

        } catch (err) {
            notify('error', 'Failed to change password');
            console.log(err.response.data);
            setErrorMessage(err.response.data);
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
                                <h2>Change Password</h2>
                            </div>
                            <Form
                                name="change-password-form"
                                autoComplete="off"
                                onFinish={onChangePasswordClick}
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
                                    name="newPassword"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input a new password!',
                                        }
                                    ]}
                                >
                                    <Input.Password
                                        size='large'
                                        placeholder='New Password'
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="newPassword2"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please confirm the new password',
                                        }
                                    ]}
                                >
                                    <Input.Password
                                        size='large'
                                        placeholder='Confirm new password'
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
                                        Change Password
                                    </Button>
                                    <div style={{
                                        margin: '12px 0',
                                        textAlign: 'center'
                                    }}>Return to
                                        <Link to={'/Profile'}>
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
                                    // display: 'none'
                                }}>
                            </div>
                        </Card>
                    </div>
                </Layout>
            </Layout>

        </>

    );
};

export default ChangePassword;