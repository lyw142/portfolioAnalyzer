import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import PortfolioCard from './components/PortfolioCard/PortfolioCard';

import Cookies from 'js-cookie';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { notify } from '../../utils/notify';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import Loading from '../Loading/Loading';
import { getPortfoliosRoute } from '../../routes';

const { Content } = Layout;

const Portfolios = () => {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [portfolios, setPortfolios] = useState(null);

    useEffect(() => {
        if (!Cookies.get('email')) {
            // console.log('Unauthenticated User, please login');
            navigate('/login');
        } else {
            // console.log('Authenticated User');
        }

        if (Cookies.get('isTempPassword')) {
            notify('Logged in with temporary password. Please change your password');
            setTimeout(() => {
                navigate("/changePassword");
            }, 3000);
        }
    }, []);

    useEffect(() => {
        if (!Cookies.get('email')) return;
        let email = Cookies.get('email');

        const fetchPortfolios = async (email) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${getPortfoliosRoute}/${email}`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch portfolios');
                    return;
                }

                const body = response.data;
                setPortfolios(body);
            } catch (err) {
                if (err.response && err.response.status === 404) { // no portfolios found
                    setPortfolios([]);
                } else {
                    notify('error', 'Failed to fetch portfolios');
                }
                setPortfolios([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPortfolios(email);
    }, []);

    const renderNoPortfolio = () => <div style={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
        minHeight: '400px',
    }}>You have yet to create a Portfolio. Create one now!</div>;

    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >
            <div className='header__container'
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '12px auto',
                }}>
                <div style={{
                    fontSize: '22px',
                    fontWeight: '600',
                }}>My Portfolios</div>
                <Link to={'/new'}>
                    <Button
                        // size='large'
                        type="primary"
                        icon={<FileAddOutlined />}
                    >
                        Add Portfolio
                    </Button>
                </Link>
            </div>
            <ToastContainer />
            <div className='portfolios__container'
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexWrap: 'wrap',
                    width: '100%',
                    gap: '32px',
                    justifyContent: 'center',

                }}>
                {isLoading ?
                    <Loading height={'80vh'} />
                    :
                    portfolios && portfolios.length === 0 ?
                        renderNoPortfolio()
                        :
                        portfolios.map((portfolio, index) => {
                            return (
                                <PortfolioCard
                                    key={index}
                                    portfolioDetails={portfolio}
                                />
                            );
                        })
                }
            </div>
        </Content>
    );
};
export default Portfolios;