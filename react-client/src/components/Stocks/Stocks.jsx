import React, { useState, useEffect } from 'react';
import { Button, Form, Input, Layout, Modal, Select } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { notify } from '../../utils/notify';
import axios from 'axios';
import { addStockRoute, getAllStocksRoute } from '../../routes';
import StockCard from '../Portfolios/components/StockCard/StockCard';
import Loading from '../Loading/Loading';
import { PlusOutlined } from '@ant-design/icons';

const { Content } = Layout;

const Stocks = () => {
    const navigate = useNavigate();
    const [stockOptions, setStockOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingAddStock, setIsLoadingAddStock] = useState(false);
    const [stocks, setStocks] = useState(null);

    useEffect(() => {
        if (!Cookies.get('email')) {
            console.log('Unauthenticated User, please login');
            navigate('/login');
        } else {
            console.log('Authenticated User');
        }

        if (Cookies.get('isTempPassword')) {
            notify('Logged in with temporary password. Please change your password');
            setTimeout(() => {
                navigate("/changePassword");
            }, 1000);
        }

        if (Cookies.get('isAdmin')) {
            console.log('Logged in as admin');
            // Hide the logs page
        }
    }, []);

    // Fetch list of stocks from backend
    const fetchStocks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(getAllStocksRoute);
            if (response.status !== 200) {
                notify('error', 'Error fetching stocks');
                return;
            }
            const body = response.data;

            const options = body?.map((stock) => {
                return (
                    {
                        label: <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between'
                            }}
                        >
                            <span><b>{stock['stockSymbol']}</b></span>
                            <span>{stock['stockName']}</span>
                        </div>,
                        value: stock['stockSymbol'],
                        title: stock['stockName'],
                    }
                );
            });

            setStockOptions(options);
            setStocks(body);
        } catch (error) {
            notify('error', 'Error fetching stocks');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, []);

    const filterOption = (input, option) =>
        (option?.value ?? '').toLowerCase().includes(input.toLowerCase()) || (option?.title ?? '').toLowerCase().includes(input.toLowerCase());

    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const onSelectStock = (stockOption) => {
        const selectedStock = stocks.find((stock) => stock.stockSymbol === stockOption.key);
        setSelectedStock(selectedStock);
    };

    const addStockToDatabase = async (values) => {
        try {
            setIsLoadingAddStock(true);
            const response = await axios.post(`${addStockRoute}`, {
                stockSymbol: values['Stock Symbol'],
                exchange: values['Stock Exchange'],
            });
            if (response.status !== 200) {
                notify('error', response.data ?? 'Error adding stocks');
                return;
            }
            notify('success', 'Stock added successfully');
            fetchStocks();
        } catch (err) {
            notify('error', err.response.data ?? 'Error adding stocks');
        } finally {
            setIsLoadingAddStock(false);
            setIsModalOpen(false);
        }
    };

    const onFinish = (values) => {
        addStockToDatabase(values);
    };

    if (isLoading) return <Loading height={'95vh'} />;

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
                    alignItems: 'center',
                    margin: '24px auto',
                    justifyContent: 'center',
                    flexDirection: 'column'
                }}>
                <div style={{
                    fontSize: '22px',
                    fontWeight: '600',
                    marginBottom: '24px'
                }}>Search Stocks</div>
                <div style={{
                    width: '50%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: '12px'
                }}>
                    <Select
                        showSearch
                        placeholder="Search Stocks"
                        options={stockOptions}
                        style={{
                            width: '100%',
                        }}
                        size='large'
                        labelInValue
                        filterOption={filterOption}
                        onChange={onSelectStock}
                    />
                    <Button
                        size='large'
                        onClick={showModal}
                        icon={<PlusOutlined />}>
                        Add Stock
                    </Button>
                    <Modal
                        footer={null}
                        title="Add Stocks to Database"
                        open={isModalOpen}
                        onOk={handleOk}
                        onCancel={handleCancel}>
                        <Form
                            name="add-stock-form"
                            onFinish={onFinish}
                            style={{
                                maxWidth: 600,
                            }}
                        >
                            <Form.Item
                                name="Stock Symbol"
                                label="Stock Symbol"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="Stock Exchange"
                                label="Stock Exchange"
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item style={{
                                textAlign: 'end'
                            }}>
                                <Button
                                    type="primary" htmlType="submit"
                                    loading={isLoadingAddStock}>
                                    Add
                                </Button>
                            </Form.Item>
                        </Form>
                    </Modal>
                </div>

                <div style={{
                    marginTop: '24px',
                    width: '50%',
                }}>
                    {selectedStock &&
                        <Link to={`/stockAnalytics/${selectedStock.stockSymbol}`}
                            state={{ stockSymbol: selectedStock.stockSymbol }}>
                            <StockCard stock={selectedStock} />
                        </Link>
                    }
                </div>
            </div>
        </Content>
    );
};
export default Stocks;