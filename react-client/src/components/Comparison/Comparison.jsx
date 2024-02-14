import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Layout } from 'antd';
import Meta from 'antd/es/card/Meta';
import { FilePptOutlined, StockOutlined } from '@ant-design/icons';

const { Content } = Layout;

const Comparison = () => {
    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: '12px auto',
                    height: '50vh',
                    gap: '32px',
                }}>
                <div style={{
                    fontSize: '22px',
                    fontWeight: '600',
                }}>Comparison</div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '32px',
                }}>
                    <Link to={'/stockComparison'}>
                        <Card
                            hoverable
                            style={{
                                width: 480,
                            }}
                        >
                            <Meta
                                avatar={<StockOutlined style={{ fontSize: 24 }} />}
                                title={`Compare Stocks`} description="Compare against two stocks on Stock Information, Annual Returns, Annualized Returns, Annualized Volatility across various time periods ranging from weeks to years." />
                        </Card>
                    </Link>

                    <Link to={'/portfolioComparison'}>
                        <Card
                            hoverable
                            style={{
                                width: 480,
                            }}
                        >
                            <Meta
                                avatar={<FilePptOutlined style={{ fontSize: 24 }} />}
                                title="Compare Portfolios" description="Compare against two portfolios on Portfolio Information, Annual Returns, Annualized Returns, Annualized Volatility across various time periods ranging from weeks to years." />
                        </Card>
                    </Link>
                </div>
            </div>


        </Content>
    );
};
export default Comparison;