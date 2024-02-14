import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout, Button, Card, Form, Input} from 'antd';

import axios from 'axios';
import logo from '../../../assets/logo.png';
import Loading from '../../Loading/Loading';
import { notify } from '../../../utils/notify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const { Header } = Layout;

const ResetPassword = () => {
    //const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onResetPasswordClick = async (values) => {
        try {
            //setIsLoading(true);

            // TODO: Reset Password logic here
            const bodyParams = {
                email: values.email,
                temporaryPassword: values.temporaryPassword,
                password: values.newPassword
            };
            console.log('bodyParams', bodyParams);

            const resetpasswordURL = `http://localhost:8080/changeUserPassword/?email=${values.email}`;
            console.log(resetpasswordURL);
            const response = await axios.put(resetpasswordURL, bodyParams);
            console.log('resetpassResponse', response);
            if (response.status === 201) {
                // navigate("/");
                notify('Success', 'Password Reset');
                
                
            }
            else if (response.status === 401) {
                console.log(response);
                setErrorMessage(response);
                console.log("Failed to add. Invalid password." +
                "\nVALID PASSWORD RULES:" +
                "\n1. It contains at least 8 characters and at most 20 characters." +
                "\n2. It contains at least one digit." +
                "\n3. It contains at least one upper case alphabet." +
                "\n4. It contains at least one lower case alphabet." +
                "\n5. It contains at least one special character which includes !@#$%&*()-+=^." +
                "\n6. It doesn’t contain any white space.");
            } else {
                notify('error', 'Unexpected error');
                return;
            }

            console.log("i am alive");


        } catch (err) {
            if (err.response.status === 401) {
                console.log("happy happy");
                console.log("Failed to add. Invalid password." +
                "\nVALID PASSWORD RULES:" +
                "\n1. It contains at least 8 characters and at most 20 characters." +
                "\n2. It contains at least one digit." +
                "\n3. It contains at least one upper case alphabet." +
                "\n4. It contains at least one lower case alphabet." +
                "\n5. It contains at least one special character which includes !@#$%&*()-+=^." +
                "\n6. It doesn’t contain any white space.");
                setErrorMessage("Failed to add. Invalid password." +
                "\nVALID PASSWORD RULES:" +
                "\n1. It contains at least 8 characters and at most 20 characters." +
                "\n2. It contains at least one digit." +
                "\n3. It contains at least one upper case alphabet." +
                "\n4. It contains at least one lower case alphabet." +
                "\n5. It contains at least one special character which includes !@#$%&*()-+=^." +
                "\n6. It doesn’t contain any white space.");
            } else {
                notify('error', 'Unexpected error');
                setErrorMessage('Unexpected error');
            }
        }

        //     notify('success', 'Password has been resetted!');
        // } catch (err) {
        //     notify('error', 'Failed to reset password');
        // } finally {
        //     setIsLoading(false);
        // }
    };
    useEffect(() => {
        // This code runs after the component has rendered.
        // Access the errorDiv element and set its text content.
        const errorDiv = document.getElementById('errorDiv');
        if (errorDiv) {
            errorDiv.textContent = errorMessage;
        }
    }, [errorMessage]);
    

    //if (isLoading) return <Loading />;
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
                                <h2>Reset Password</h2>
                            </div>
                            <Form
                                name="reset-password-form"
                                autoComplete="off"
                                onFinish={onResetPasswordClick}
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
                                    name="temporaryPassword"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input the temporary password!',
                                        }
                                    ]}
                                >
                                    <Input.Password
                                        size='large'
                                        placeholder='Temporary Password'
                                    />
                                </Form.Item>

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
                                <Form.Item>
                                    <Button
                                        htmlType="submit"
                                        size='large'
                                        type="primary"
                                        style={{
                                            width: '100%',
                                        }}
                                    >
                                        Reset Password
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

        </>

    );
};

export default ResetPassword;