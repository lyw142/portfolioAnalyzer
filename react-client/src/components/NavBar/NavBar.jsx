import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, message } from 'antd';

import logo from '../../assets/logo.png';
// import logo from '../../assets/logoWhite.png';
import Loading from '../Loading/Loading';
import { notify } from '../../utils/notify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Cookies from 'js-cookie';

const { Header } = Layout;

const NavBar = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setIsAdminUser(Cookies.get('isAdmin') === 'true' ? true : false);
    }, []);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            notify('success', 'Successfully logged out');
            //console.log("email cookie: " + Cookies.get('email') + " removed");
            Cookies.remove('email');
            //console.log("isAdmin cookie: " + Cookies.get('isAdmin') + " removed");
            Cookies.remove('isAdmin');
            navigate("/login");
        } catch (err) {
            notify('error', 'Failed to log out');
        } finally {
            setIsLoading(false);
        }
    };

    const items = [
        {
            label: 'Portfolios',
            key: 1,
            onClick: () => navigate('/'),
        },
        {
            label: 'Stocks',
            key: 2,
            onClick: () => navigate('/stocks'),
        },
        {
            label: 'Comparison',
            key: 3,
            onClick: () => navigate('/comparison'),
        },
        {
            label: 'Logs',
            key: 4,
            onClick: () => navigate('/logs'),
        },
        {
            label: 'Profile',
            key: 5,
            onClick: () => navigate('/profile'),
        },
    ];

    const filteredItems = !isAdminUser ? items.filter(item => item.label !== 'Logs') : items;

    if (isLoading) return <Loading />;
    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                background: 'white',
                // background: '#141414',
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
                    // background: '#141414',
                }}>

                <div style={{
                    display: 'flex',
                    cursor: 'pointer'
                }}
                    onClick={() => navigate('/')}>
                    <img src={logo} height={35} alt='logo' />
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Menu
                        theme="light"
                        mode="horizontal"
                        items={filteredItems}
                        style={{ border: 0 }}
                        defaultSelectedKeys={'1'}
                    />
                    <Button
                        onClick={(e) => handleLogout(e)}>
                        Logout
                    </Button>
                </div>
            </div>
        </Header>
    );
};

export default NavBar;