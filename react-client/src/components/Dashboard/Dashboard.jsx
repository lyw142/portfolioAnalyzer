import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import NavBar from '../NavBar/NavBar';

const Dashboard = () => {
    return (
        <Layout style={{
            // background: 'white'
        }}>
            <NavBar />
            <Layout
                style={{
                    marginTop: '50px',
                    // background: 'white'
                }}>
                <Outlet />
            </Layout>
        </Layout>
    );
};
export default Dashboard;