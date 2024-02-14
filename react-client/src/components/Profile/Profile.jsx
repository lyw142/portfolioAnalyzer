import React, { useState } from 'react';


import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Descriptions } from 'antd';
import { notify } from '../../utils/notify';

const { Content } = Layout;

const Profile = () => {
    const navigate = useNavigate();
    
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

    const email = Cookies.get('email');
    const username = email.substring(0, Cookies.get('email').indexOf('@'));

    const items = [
        {
            key: '1',
            label: 'Username',
            children: username,
        },
        {
            key: '2',
            label: 'Email',
            children: email,
        },
    ];

    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >

            <Descriptions title="User Info" items={items} />

            
            <Link to={'/updateEmail'}>
                <Button
                    size='large'
                    style={{ marginRight: '30px'}}
                    type="primary"
                >
                        Update Email
                </Button>
            </Link>

            <Link to={'/changePassword'}>
                <Button
                    size='large'
                    type="primary"
                >
                        Change Password
                </Button>
            </Link>


        </Content>
    );
};
export default Profile;