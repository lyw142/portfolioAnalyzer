import React, { useEffect, useState } from 'react';
import { Button, Layout, Card, Space, Modal, Segmented, } from 'antd';
import { DeleteOutlined, EditOutlined, LeftOutlined, StockOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Loading from '../../../Loading/Loading';
import StockCard from '../StockCard/StockCard';
import DonutChart from './components/DonutChart/DonutChart';
import axios from 'axios';
import { deletePortfolioRoute, getPortfolioRoute, historicalPriceRoute } from '../../../../routes';
import { notify } from '../../../../utils/notify';
import LineChart from './components/LineChart/LineChart';

const { Content } = Layout;


const PortfolioDetails = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [portfolioData, setPortfolioData] = useState(null);
    const [historicalPriceMonthly, setHistoricalPriceMonthly] = useState(null);
    const [historicalPriceDaily, setHistoricalPriceDaily] = useState(null);
    const [amountPlaced, setAmountPlaced] = useState(null);
    const [availableAmount, setAvailableAmount] = useState(null);
    const [historicalRange, setHistoricalRange] = useState('Monthly');

    const { confirm } = Modal;
    const { portfolioID } = useParams();

    const navigate = useNavigate();

    const { state } = useLocation();
    const portfolioDetails = state ? state.portfolioDetails : null;

    useEffect(() => {
        if (!portfolioDetails) {
            fetchPortfolio(portfolioID);
        } else {
            setPortfolioData(portfolioDetails);
        }
    }, [portfolioDetails]);

    useEffect(() => {
        fetchHistoricalPriceMonthly(portfolioID);
        fetchHistoricalPriceDaily(portfolioID);
    }, [portfolioID]);

    useEffect(() => {
        if (!portfolioData) return;
        const placed = portfolioData.stockList?.reduce((acc, stock) => {
            return acc + stock.qty * stock.currentStockPrice;
        }, 0);
        const available = portfolioData.capitalAmount - placed;

        setAmountPlaced(placed?.toFixed(2));
        setAvailableAmount(available?.toFixed(2));

    }, [portfolioData]);

    const fetchPortfolio = async (portfolioID) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${getPortfolioRoute}/${portfolioID}`);

            if (response.status !== 200) {
                notify('error', 'Failed to fetch portfolio');
                return;
            }

            const body = response.data;
            setPortfolioData(body);
        } catch (err) {
            notify('error', 'Failed to fetch portfolio');
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistoricalPriceMonthly = async (portfolioID) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${historicalPriceRoute}/${portfolioID}/historicalPricePercentageChange/monthly`);

            if (response.status !== 200) {
                notify('error', 'Failed to fetch historical price - monthly');
                return;
            }
            const body = response.data;
            setHistoricalPriceMonthly(body);
        } catch (err) {
            notify('error', 'Failed to fetch historical price - monthly');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHistoricalPriceDaily = async (portfolioID) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${historicalPriceRoute}/${portfolioID}/historicalPricePercentageChange/daily`);

            if (response.status !== 200) {
                notify('error', 'Failed to fetch historical price - daily');
                return;
            }
            const body = response.data;
            setHistoricalPriceDaily(body);
        } catch (err) {
            notify('error', 'Failed to fetch historical price - daily');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePortfolio = async (portfolioId, userEmail) => {
        try {
            const response = await axios.delete(`${deletePortfolioRoute}/${portfolioId}/${userEmail}`);

            if (response.status !== 200) {
                notify('error', 'Failed to delete portfolio');
            }
            // TBC: for case where portfolio not found under user to return 4XX instead of 200
            notify('success', `${response.data}`);
            navigate('/');
        } catch (err) {
            notify('error', 'Failed to delete portfolio');
            console.error(err);
        }
    };

    const deletePortfolio = () => {
        confirm({
            title: 'Delete Portfolio?',
            icon: <DeleteOutlined style={{
                color: '#ff4d4f'
            }} />,
            centered: true,
            content: (
                <div>
                    <p>Are you sure to delete this Portfolio? This action is irreversible.</p>
                </div>
            ),
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                const portfolioId = portfolioData.portfolioId;
                const userEmail = portfolioData.userEmail;
                handleDeletePortfolio(portfolioId, userEmail);
            },
            onCancel() { },
        });
    };

    if (isLoading) return <Loading />;
    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 1300,
            }}
        >
            <div className='action__container'
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    margin: '12px auto'
                }}>
                <Link to={'/'}>
                    <Button
                        icon={<LeftOutlined />}
                    >
                        Back
                    </Button>
                </Link>

                <Space>
                    <Link
                        to={`/portfolioAnalytics/${portfolioID}`}
                    >
                        <Button
                            icon={<StockOutlined />}
                        >
                            More Analytics
                        </Button>
                    </Link>
                    <Button
                        danger
                        type="primary"
                        icon={<DeleteOutlined />}
                        onClick={deletePortfolio}
                    >
                        Delete
                    </Button>

                    <Link
                        to={`/${portfolioID}/edit`}
                        state={{ initialValues: portfolioData }}
                    >
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                        >
                            Edit
                        </Button>
                    </Link>
                </Space>
            </div>
            <Card style={{
                margin: '12px 0 8px'
            }}>
                <div className='portfolioDetails__header'>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                        }}>
                        <div style={{
                            minWidth: '150px',
                            fontSize: 16,
                            fontWeight: 500,
                            marginRight: 12
                        }}>Portfolio:</div>
                        <span>
                            {portfolioData && portfolioData.portfolioName}</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}>
                        <div style={{
                            minWidth: '150px',
                            fontSize: 16,
                            fontWeight: 500,
                            marginRight: 12
                        }}>Strategy Description:</div>
                        <p>{portfolioData && portfolioData.portfolioStrategy}</p>
                    </div>
                </div>
            </Card>

            <div
                className='portfolioDetails__content'
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'start',
                    width: '100%',
                    height: '800px',
                    gap: '8px'
                }}>
                <div className='portfolioDetails__content__left'
                    style={{
                        width: '35%',
                    }}>
                    <Card
                        style={{
                            height: '100%',
                        }}>
                        <div style={{
                            fontSize: 16,
                            fontWeight: 500,
                            marginBottom: 12
                        }}>My Stocks</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            {
                                portfolioData && portfolioData?.combinedStockList?.map((stock, index) => {
                                    return (
                                        <Link
                                            to={`/stockAnalytics/${stock.stockSymbol}`}
                                            state={{ stockSymbol: stock.stockSymbol }}
                                            key={index}>
                                            <StockCard
                                                key={index}
                                                stock={stock}
                                                showPercentage={true}
                                                percentage={portfolioData && portfolioData.percentAllocated[stock.stockSymbol]}
                                            />
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    </Card>
                </div>
                <div className='portfolioDetails__content__right'
                    style={{
                        width: '65%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        minHeight: '600px',
                    }}
                >
                    <div className='portfolioDetails__content__right__top'
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row',
                            width: '100%',
                            gap: 12
                        }}>
                        <Card
                            style={{
                                height: '250px',
                                width: '100%',
                                gap: 12
                            }}
                            bodyStyle={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%'
                            }}>
                            <div>
                                <div className="balanceHeader">
                                    <div style={{
                                        fontSize: 20,
                                    }}>Capital Amount</div>
                                </div>
                                <div className="balanceAmount" style={{
                                    color: '#0BA023',
                                    fontSize: 22,
                                    fontWeight: 500,
                                }}>
                                    <span>{portfolioData && `$${portfolioData.capitalAmount}`}</span>
                                </div>
                            </div>

                            <div>
                                <div className="balance__content"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                    }}>
                                    <span style={{
                                        fontWeight: 500
                                    }}>Available</span>
                                    <span>${availableAmount}</span>
                                </div>
                                <div className="balance__content"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                    <span style={{
                                        fontWeight: 500
                                    }}>Placed</span>
                                    <span>${amountPlaced}</span>
                                </div>
                            </div>
                        </Card>

                        <Card style={{
                            flex: 1,
                            // height: '225px',
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{
                                    fontSize: 20,
                                    marginBottom: 20
                                }}>Sector Allocation</div>
                            </div>


                            <DonutChart
                                type={'sector'}
                                allocation={portfolioData && portfolioData.sectorAllocated}
                            />

                        </Card>

                    </div>


                    <Card style={{
                        flex: 1
                    }}>
                        <div style={{
                            fontSize: 20,
                            marginBottom: 20
                        }}>Industry Allocation</div>
                        <DonutChart
                            type={'industry'}
                            allocation={portfolioData && portfolioData.industryAllocated}
                        />
                    </Card>



                    <Card style={{
                        flex: 1
                    }}>
                        <div style={{
                            fontSize: 20,
                            marginBottom: 20
                        }}>Historical Returns</div>
                        <Segmented
                            options={[
                                { label: 'Monthly', value: 'Monthly' },
                                { label: 'Daily', value: 'Daily' },
                            ]}
                            value={historicalRange}
                            onChange={setHistoricalRange} />

                        <LineChart
                            dataset={historicalRange === 'Monthly' ? historicalPriceMonthly : historicalPriceDaily}
                            type={historicalRange}
                        />

                    </Card>


                </div>

            </div>


        </Content>
    );
};
export default PortfolioDetails;