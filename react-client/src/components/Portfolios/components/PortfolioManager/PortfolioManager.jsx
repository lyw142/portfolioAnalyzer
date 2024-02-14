import React, { useState, useEffect } from 'react';
import { Layout, Form, Input, Button, InputNumber, Select, Modal } from 'antd';
import TextArea from "antd/es/input/TextArea";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DeleteOutlined, FileAddOutlined, LeftOutlined } from '@ant-design/icons';
import SelectStockConfig from './components/SelectStockConfig/SelectStockConfig';
import StockCard from '../StockCard/StockCard';
import axios from 'axios';
import { notify } from '../../../../utils/notify';
import 'react-toastify/dist/ReactToastify.css';
import { createPortfolioRoute, getAllStocksRoute, getStockByStockSymbol } from '../../../../routes';
import Cookies from 'js-cookie';
import RebalanceStocks from './components/RebalanceStocks/RebalanceStocks';

const { Content } = Layout;

const PortfolioManager = () => {
    const [form] = Form.useForm();

    const navigate = useNavigate();

    const { state } = useLocation();
    const initialValues = state ? state.initialValues : null;

    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [stockPriceMapping, setStockPriceMapping] = useState([]);
    const [stockExchangeMapping, setStockExchangeMapping] = useState([]);
    const [stockOptions, setStockOptions] = useState([]);

    const [selectedStock, setSelectedStock] = useState(null);
    const [stocksToAdd, setStocksToAdd] = useState([]);
    const [stocksToDelete, setStocksToDelete] = useState([]);
    const [existingStocks, setExistingStocks] = useState([]);

    const [capitalAmount, setCapitalAmount] = useState(0);
    const [amountAvailable, setAmountAvailable] = useState(0);
    const [amountPlaced, setAmountPlaced] = useState(0);

    useEffect(() => {
        if (!initialValues) return;

        // populate existing form field inputs
        form.setFieldsValue(initialValues);

        setCapitalAmount(initialValues.capitalAmount);
        setExistingStocks(initialValues.stockList);
        setIsEditing(true);
    }, []);

    useEffect(() => {
        // to remove warning once a stock is added 
        form.validateFields(['stocks']);
    }, [stocksToAdd, existingStocks]);

    useEffect(() => {
        if (!selectedStock) form.resetFields(['stocks']);
    }, [selectedStock]);

    // calculate capital balance placed and left
    useEffect(() => {
        const placed = stocksToAdd.reduce((prev, curr) => prev + curr.qty * curr.currentStockPrice, 0) + existingStocks.reduce((prev, curr) => prev + curr.qty * curr.currentStockPrice, 0);

        const available = capitalAmount - placed;
        setAmountPlaced(placed.toFixed(2));
        setAmountAvailable(available.toFixed(2));
    }, [capitalAmount, existingStocks, stocksToAdd]);

    useEffect(() => {
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

                const stockPrices = body.reduce((prev, curr) => {
                    prev[curr.stockSymbol] = curr.currentStockPrice;
                    return prev;
                }, {});

                const stockExchanges = body.reduce((prev, curr) => {
                    prev[curr.stockSymbol] = curr.exchange;
                    return prev;
                }, {});

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

                setStockExchangeMapping(stockExchanges);
                setStockPriceMapping(stockPrices);
                setStockOptions(options);
            } catch (error) {
                notify('error', 'Error fetching stocks');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStocks();
    }, []);

    const filterOption = (input, option) =>
        (option?.value ?? '').toLowerCase().includes(input.toLowerCase()) || (option?.title ?? '').toLowerCase().includes(input.toLowerCase());

    const handleCreatePortfolio = async (values) => {
        try {
            setIsLoading(true);
            const body = {
                ...values,
                capitalAmount: String(values.capitalAmount.toFixed(2)),
                userEmail: Cookies.get('email'),
                stocks: stocksToAdd.map(stock => ({
                    stockSymbol: stock.stockSymbol,
                    qty: stock.qty,
                    exchange: stock.exchange,
                })),
            };

            const response = await axios.post(`${createPortfolioRoute}`, body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

            if (response.status !== 200) {
                notify('error', 'Error creating portfolio');
                return;
            }

            notify('success', 'Portfolio created successfully');
            navigate('/');
        } catch (err) {
            notify('error', 'Error creating portfolio');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPortfolio = async (values) => {
        try {
            setIsLoading(true);
            const body = {
                portfolioName: values.portfolioName,
                portfolioStrategy: values.portfolioStrategy ? values.portfolioStrategy : null,
                capitalAmount: String(values.capitalAmount.toFixed(2)),
                addedStocks: stocksToAdd.map(stock => ({
                    stockSymbol: stock.stockSymbol,
                    qty: stock.qty,
                    exchange: stock.exchange,
                })),
                deletedStocks: stocksToDelete.map(stock => ({
                    stockSymbol: stock.stockSymbol,
                    qty: stock.qty,
                    currentStockPrice: String(stock.currentStockPrice),
                    purchasedDateTime: stock.purchasedDateTime,
                }))
            };

            const response = await axios.put(`http://localhost:8080/${initialValues.portfolioId}/edit`, body);

            if (response.status !== 200) {
                notify('error', 'Error updating portfolio');
                return;
            }

            notify('success', 'Portfolio updated successfully');
            // navigate back to the portfolio page
            navigate(`/${initialValues.portfolioId}`);
            // navigate('/');
        } catch (err) {
            notify('error', 'Error updating portfolio');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const onFinish = (values) => {
        if (!isEditing) {
            handleCreatePortfolio(values);
        } else {
            handleEditPortfolio(values);
        }
    };

    const onSelectStock = (stockOption) => {
        // Fetch single stock to get latest stock price
        const fetchStock = async (symbol) => {
            try {
                const response = await axios.get(`${getStockByStockSymbol}/${symbol}`);
                if (response.status !== 200) return;
                const body = response.data;

                // update stockPriceMapping with latest currentStockPrice
                setStockPriceMapping(prevStockPriceMapping => ({
                    ...prevStockPriceMapping,
                    [symbol]: body.currentStockPrice
                }));
            } catch (err) {
                // do nothing
                // fall back on initial retrieved currentStockPrice from fetchStocks
            } finally {
                setSelectedStock({
                    stockSymbol: stockOption.key,
                    stockName: stockOption.title,
                    stockExchange: stockExchangeMapping[stockOption.key],
                });
            }
        };

        fetchStock(stockOption.key);
    };

    // deleting buy order (BEFORE SUBMISSION)
    const handleDeleteBuyOrder = (stock) => {
        const symbolToDelete = stock.stockSymbol;
        const indexToDelete = stocksToAdd.findIndex(stock => stock.stockSymbol === symbolToDelete);

        if (indexToDelete !== -1) {
            const updatedStocksToAdd = stocksToAdd.filter((stock, index) => index !== indexToDelete);
            setStocksToAdd(updatedStocksToAdd);
        }
    };

    // delete EXISTING stock (not saved till Update is clicked)
    const handleDeleteExistingStock = (stock) => {
        Modal.confirm({
            centered: true,
            title: 'Delete existing stock',
            icon: <DeleteOutlined style={{
                color: '#ff4d4f'
            }} />,
            content: (
                <div>
                    <p>Confirm deletion of an existing stock? Changes will only be saved when you update the portfolio.</p>
                </div>
            ),
            okText: 'Proceed',
            onOk() {
                const symbolToDelete = stock.stockSymbol;
                const indexToDelete = existingStocks.findIndex(stock => stock.stockSymbol === symbolToDelete);

                if (indexToDelete !== -1) {
                    const deletedStock = existingStocks[indexToDelete];
                    const updatedExistingStocks = existingStocks.filter((stock, index) => index !== indexToDelete);
                    setStocksToDelete(prevStocksToDelete => [
                        ...prevStocksToDelete,
                        deletedStock
                    ]);
                    setExistingStocks(updatedExistingStocks);
                }
            },
            cancelText: 'Cancel',
            onCancel() { },
        });
    };

    const handleUndoDeleteStock = (stock) => {
        Modal.confirm({
            centered: true,
            title: 'Undo deletion of stock',
            content: (
                <div>
                    <p>Undo the deletion of an existing stock? By proceeding, this stock will return to the list of existing stocks.</p>
                </div>
            ),
            okText: 'Proceed',
            onOk() {
                const symbol = stock.stockSymbol;
                const indexToUndoDeletion = stocksToDelete.findIndex(stock => stock.stockSymbol === symbol);

                if (indexToUndoDeletion !== -1) {
                    const stockToUnderDeletion = stocksToDelete[indexToUndoDeletion];
                    const updatedStocksToDelete = stocksToDelete.filter((stock, index) => index !== indexToUndoDeletion);

                    setStocksToDelete(updatedStocksToDelete);
                    setExistingStocks(prevExistingStocks => [
                        ...prevExistingStocks,
                        stockToUnderDeletion
                    ]);
                }
            },
            cancelText: 'Cancel',
            onCancel() { },
        });
    };

    // during editing, if there are existing stocks purchased
    const renderExistingStocks = () => <div
        className='existingStocks'
        style={{
            maxWidth: 600,
        }}>
        <div style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between'
        }}>
            <span>Existing Stocks</span>
            <RebalanceStocks
                portfolioId={initialValues.portfolioId}
                combinedStockList={initialValues.combinedStockList}
                existingStocks={existingStocks}
                setExistingStocks={setExistingStocks}
                setStocksToAdd={setStocksToAdd}
                setStocksToDelete={setStocksToDelete}
                stocksToDelete={stocksToDelete}
            />
        </div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}>
            {
                existingStocks.map((stock) =>
                    <StockCard
                        key={`${stock.stockSymbol}-${stock.purchasedDateTime}`}
                        stock={stock}
                        editable={false}
                        deletable={true}
                        isLoading={isLoading}
                        setSelectedStock={setSelectedStock}
                        handleDeleteStock={handleDeleteExistingStock}
                        showPercentage={false}
                    />
                )
            }
        </div>
    </div>;

    const renderDeletedStocks = () => <div
        className='deletedStocks'
        style={{
            maxWidth: 600,
        }}>
        <div style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 8
        }}>Deleted Stocks</div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}>
            {
                stocksToDelete.map((stock) =>
                    <StockCard
                        key={`${stock.stockSymbol}-${stock.purchasedDateTime}`}
                        stock={stock}
                        isDeleted={true}
                        isLoading={isLoading}
                        setSelectedStock={setSelectedStock}
                        handleUndoDeleteStock={handleUndoDeleteStock}
                        showPercentage={false}
                    />
                )
            }
        </div>
    </div>;

    const renderStocksToAdd = () => <div
        className='stocksToAdd'
        style={{
            maxWidth: 600,
        }}>
        <div style={{
            fontSize: 16,
            fontWeight: 500,
            marginBottom: 8
        }}>Buy Order</div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        }}>
            {
                stocksToAdd.map((stock) =>
                    <StockCard
                        key={`${stock.stockSymbol}-${stock.purchasedDateTime}`}
                        stock={stock}
                        editable={true}
                        deletable={true}
                        isLoading={isLoading}
                        setSelectedStock={setSelectedStock}
                        handleDeleteStock={handleDeleteBuyOrder}
                        showPercentage={false}
                    />
                )
            }
        </div>
    </div>;

    const renderStockConfig = () => <div
        className="portfolioManager__right"
        style={{
            display: 'flex',
            flexDirection: 'column',
            width: '50%'
        }}>
        {
            selectedStock ?
                <SelectStockConfig
                    form={form}
                    currentPrice={stockPriceMapping[selectedStock.stockSymbol]}
                    symbol={selectedStock.stockSymbol}
                    name={selectedStock.stockName}
                    selectedStock={selectedStock}
                    setSelectedStock={setSelectedStock}
                    stocksToAdd={stocksToAdd}
                    setStocksToAdd={setStocksToAdd}
                /> : null
        }
    </div>;

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
                    margin: '12px auto 24px',

                }}>
                <Link
                    to={isEditing ? `/${initialValues.portfolioId}` : '/'}
                    state={{
                        portfolioDetails: initialValues
                    }}
                >
                    <Button
                        icon={<LeftOutlined />}
                    >
                        Back
                    </Button>
                </Link>

                <div style={{
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '22px',
                    fontWeight: '600',
                }}>
                    {isEditing ? 'Edit' : 'Create'} Portfolio
                </div>
                <Button
                    // size='large'
                    icon={<FileAddOutlined />}
                    htmlType='submit'
                    type='primary'
                    onClick={() => form.submit()}
                >
                    {isEditing ? 'Update' : 'Create'}
                </Button>
            </div>

            <div className="portfolioManager__content"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'flex-start'

                }}>

                <div className="portfolioManager__left"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '50%',
                        marginRight: 20
                    }}>
                    <Form
                        name='create-edit-portfolio'
                        layout={'vertical'}
                        form={form}
                        style={{
                            maxWidth: 600,
                        }}
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="portfolioName"
                            label="Portfolio Name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input a portfolio name!',
                                },
                            ]}
                        >
                            <Input
                                allowClear
                                size='large'
                            />
                        </Form.Item>

                        <Form.Item
                            name="portfolioStrategy"
                            label="Strategy Description"
                        >
                            <TextArea
                                size='large'
                                allowClear
                                rows={4}
                            />
                        </Form.Item>

                        <Form.Item
                            name="capitalAmount"
                            label="Capital Amount"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input a capital amount!',
                                },
                                () => ({
                                    validator(_, value) {
                                        if (value >= amountPlaced) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Capital amount must be greater than amount placed'));
                                    },
                                }),
                            ]}

                        >
                            <InputNumber
                                style={{
                                    width: '100%'
                                }}
                                size='large'
                                prefix="$"
                                suffix="USD"
                                step="0.01"
                                onChange={(value) => setCapitalAmount(value)}
                            />
                        </Form.Item>

                        {/* Section that calculates available amount and amount placed */}
                        <div className="capitalBalance" style={{
                            margin: '0 0 16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}>
                                <span style={{ fontWeight: 500 }}>Placed</span>
                                <span style={{
                                    fontWeight: 500,
                                    color: amountPlaced > capitalAmount && 'red'
                                }}>${amountPlaced}</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',

                            }}>
                                <span style={{ fontWeight: 500 }}>Available</span>
                                <span style={{
                                    fontWeight: 500,
                                    color: amountAvailable <= capitalAmount && amountAvailable > 0 ? 'green' : 'black'
                                }}>${amountAvailable > 0 ? amountAvailable : 0}</span>
                            </div>
                        </div>


                        <Form.Item
                            name={'stocks'}
                            label="Select Stocks"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if ((stocksToAdd && stocksToAdd.length > 0) ||
                                            (existingStocks && existingStocks.length > 0) ||
                                            (value)
                                        ) {
                                            return Promise.resolve();
                                        } else {
                                            return Promise.reject(new Error('Please have at least one stock in your portfolio!'));
                                        }
                                    },
                                },
                            ]}
                        >
                            <Select
                                showSearch
                                value={selectedStock ? {
                                    value: selectedStock.name,
                                    label: selectedStock.name
                                } : null}
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
                        </Form.Item>
                    </Form>
                    {stocksToDelete.length > 0 && renderDeletedStocks()}
                    <br />
                    {existingStocks.length > 0 && renderExistingStocks()}
                    <br />
                    {stocksToAdd.length > 0 && renderStocksToAdd()}
                </div>
                {selectedStock && renderStockConfig()}
            </div>
        </Content >
    );
};
export default PortfolioManager;