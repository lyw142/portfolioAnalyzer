
import React from 'react';
import { Card, Divider, Space, } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

const StockCard = ({
    stock = {},
    isLoading = false,
    editable = false,
    deletable = false,
    isDeleted = false, // for deleted ones from existing stocks
    setSelectedStock = null,
    handleDeleteStock = null,
    handleUndoDeleteStock = null,
    showPercentage = false,
    percentage = null
}) => {
    return (
        <Card
            size='small'
            loading={isLoading}
            style={{
                background: isDeleted ? '#ffffff' : 'white',
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
            }}>
                <div style={{
                    textDecoration: isDeleted ? 'line-through' : 'none',
                }}>
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 500,
                            display: 'flex',
                        }}>
                        <span style={{
                            marginRight: 20
                        }}>{stock.stockSymbol}</span>
                        <span>{stock.stockName}</span>
                    </div>
                    <div style={{
                        fontSize: 12,
                        color: '#7C8DB5'
                    }}>
                        {stock.qty &&
                            <>
                                <span>Quantity: {stock.qty}</span>
                                <Divider type="vertical" style={{ borderColor: '#99AABB' }} />
                            </>
                        }
                        {stock.avgStockPrice ? // existing stocks in PortfolioDetails page will use avgStockPrice
                            <>
                                <span>Buy Price: ${stock.avgStockPrice}</span>
                            </>
                            :
                            <>
                                <span>Buy Price: ${stock.currentStockPrice}</span>
                            </>
                        }
                        <br />
                        {showPercentage && <span>Percentage: {percentage}%</span>}
                    </div>
                </div>
                <Space wrap>
                    <div style={{
                        fontSize: 15,
                        fontWeight: 500,
                    }}>
                        {
                            // stocks in single portfolio view will use avgStockPrice
                            stock.avgStockPrice && stock.qty ?
                                `$${(stock.avgStockPrice * stock.qty).toFixed(2)}`
                                : stock.currentStockPrice && stock.qty ?
                                    `$${(stock.currentStockPrice * stock.qty).toFixed(2)}` : ''
                        }
                    </div>
                    {editable &&
                        <EditOutlined
                            style={{
                                cursor: 'pointer',
                                color: '#7C8DB5'
                            }}
                            onClick={() => setSelectedStock(stock)}
                        />}

                    {deletable &&
                        <DeleteOutlined style={{
                            cursor: 'pointer',
                            color: '#ff4d4f'
                        }}
                            onClick={() => handleDeleteStock(stock)}
                        />}

                    {isDeleted &&
                        <div style={{
                            fontSize: 12,
                            color: '#7C8DB5',
                            cursor: 'pointer',
                        }}
                            onClick={() => handleUndoDeleteStock(stock)}>
                            Undo
                        </div>}
                </Space>
            </div>
        </Card>
    );
};

export default StockCard;