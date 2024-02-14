
import React from 'react';
import { Card, Divider, Space, Statistic, Typography } from 'antd';
import { Link } from 'react-router-dom';
import Meta from 'antd/es/card/Meta';
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;


const PortfolioCard = ({ portfolioDetails }) => {
    const {
        portfolioId,
        portfolioName,
        portfolioStrategy,
        createdDate,
        annualReturn
    } = portfolioDetails;

    return (
        <Link
            to={`/${portfolioId}`}
            state={{
                portfolioDetails: portfolioDetails
            }}
            key={portfolioId}
        >
            <Card
                key={portfolioId}
                style={{
                    // width: '425px'
                }}
                hoverable
            >
                <div
                    style={{
                        fontSize: '20px',
                        fontWeight: '600',
                    }}>
                    {portfolioName}
                </div>
                <Text italic type="secondary" style={{
                    fontSize: '12px',
                }}>
                    Created: {dayjs(createdDate).format('DD MMM YYYY h:mm A')}
                </Text>

                {
                    portfolioStrategy &&
                    <div style={{
                        margin: '12px 0 0',
                        color: '#7C8DB5'
                    }}>
                        <Meta
                            description={`Strategy: ${portfolioStrategy}`}
                        />
                    </div>
                }
                <div style={{
                    padding: '24px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <Space>
                        <Statistic
                            title={`Annual Return in ${Object.entries(annualReturn)[Object.entries(annualReturn).length - 1][0]}`}
                            value={Object.entries(annualReturn)[Object.entries(annualReturn).length - 1][1]}
                            precision={2}
                            valueStyle={{
                                color: `${Object.entries(annualReturn)[Object.entries(annualReturn).length - 1][1] > 0 ? '#3f8600' : '#cf1322'}`, fontSize: '16px'
                            }}
                            suffix="%"
                            prefix={Object.entries(annualReturn)[Object.entries(annualReturn).length - 1][1] > 0 ? <ArrowUpOutlined /> :
                                <ArrowDownOutlined />
                            }
                        />
                        {
                            Object.entries(annualReturn).length > 1 &&
                            <>
                                <Divider type="vertical" />
                                <Statistic
                                    title={`Annual Return in ${Object.entries(annualReturn)[Object.entries(annualReturn).length - 2][0]}`}
                                    value={Object.entries(annualReturn)[Object.entries(annualReturn).length - 2][1]}
                                    precision={2}
                                    valueStyle={{
                                        color: `${Object.entries(annualReturn)[Object.entries(annualReturn).length - 2][1] > 0 ? '#3f8600' : '#cf1322'}`, fontSize: '16px'
                                    }}
                                    suffix="%"
                                    prefix={Object.entries(annualReturn)[Object.entries(annualReturn).length - 2][1] > 0 ? <ArrowUpOutlined /> :
                                        <ArrowDownOutlined />
                                    }
                                />
                            </>
                        }
                    </Space>

                </div>
            </Card>
        </Link>
    );
};

export default PortfolioCard;