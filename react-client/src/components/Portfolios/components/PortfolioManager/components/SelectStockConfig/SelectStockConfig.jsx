import React, { useEffect, useState } from 'react';
import { InputNumber, Modal, Button, Card, Divider } from 'antd';
import StockInfo from '../StockInfo/StockInfo';
import { notify } from '../../../../../../utils/notify';
import 'react-toastify/dist/ReactToastify.css';

const SelectStockConfig = ({ currentPrice, selectedStock, setSelectedStock, stocksToAdd, setStocksToAdd }) => {
    // isEditing refers to the editing the stock card itself
    const [isEditing, setIsEditing] = useState(false);
    const [allocatedQuantity, setAllocatedQuantity] = useState(1);

    useEffect(() => {
        if (selectedStock && selectedStock.qty) {
            setAllocatedQuantity(selectedStock.qty);
            setIsEditing(true);
        } else {
            setIsEditing(false);
        }
    }, [selectedStock]);

    const handleSubmitBuyOrder = () => {
        // Validate if Buy Order already exist in the submitted Buy Orders
        const index = stocksToAdd.findIndex(stock => stock.stockSymbol === selectedStock.stockSymbol);
        if (index !== -1) {
            Modal.confirm({
                centered: true,
                title: 'Existing Buy Order',
                content: (
                    <div>
                        <p>There is already an existing buy order for this stock. This action will override the existing buy order. Proceed?</p>
                    </div>
                ),
                okText: 'Proceed',
                onOk() {
                    const updatedStocksToAdd = [...stocksToAdd];
                    updatedStocksToAdd[index] = {
                        stockSymbol: selectedStock.stockSymbol,
                        stockName: selectedStock.stockName,
                        qty: allocatedQuantity,
                        currentStockPrice: currentPrice,
                        exchange: selectedStock.stockExchange
                    };
                    setStocksToAdd(updatedStocksToAdd);
                    setSelectedStock(null);
                },
                cancelText: 'Cancel',
                onCancel() { },
            });
        } else {
            setStocksToAdd(prevstocksToAdd => [
                ...prevstocksToAdd,
                {
                    stockSymbol: selectedStock.stockSymbol,
                    stockName: selectedStock.stockName,
                    qty: allocatedQuantity,
                    currentStockPrice: currentPrice,
                    exchange: selectedStock.stockExchange
                }
            ]);
            setSelectedStock(null);
        }

        notify('success', 'Successfully added buy order');
    };

    const handleUpdateBuyOrder = () => {
        const indexToUpdate = stocksToAdd.findIndex(stock => stock.stockSymbol === selectedStock.stockSymbol);
        if (indexToUpdate !== -1) {
            const updatedStocksToAdd = [...stocksToAdd];

            updatedStocksToAdd[indexToUpdate] = {
                stockSymbol: selectedStock.stockSymbol,
                stockName: selectedStock.name,
                qty: allocatedQuantity,
                currentStockPrice: currentPrice,
                exchange: selectedStock.stockExchange
            };
            setStocksToAdd(updatedStocksToAdd);
            setSelectedStock(null);
        }
        notify('success', 'Successfully updated buy order');
    };

    return (
        <Card>
            <div className="stockConfig"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '570px',
                    justifyContent: 'space-between',
                }}>
                <div className='stockConfig__header'>
                    {/* <div style={{
                        fontSize: '18px'
                    }}>Buy Order: {selectedStock.symbol}{' '}{selectedStock.name}</div> */}
                    <Divider
                        orientation="left"
                        orientationMargin="0">
                        Buy Order: {selectedStock.stockSymbol}{' '}{selectedStock.stockName}
                    </Divider>

                </div>

                <div className='stockConfig__allocation'
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-start'
                    }}>

                    <InputNumber
                        min={1}
                        precision={0}
                        suffix="QTY"
                        style={{
                            width: '35%'
                        }}
                        size='large'
                        defaultValue={selectedStock.qty || 1}
                        onChange={setAllocatedQuantity}
                    />

                    <span><b>Total:</b> ${(allocatedQuantity * currentPrice).toFixed(2)}</span>

                </div>

                <StockInfo
                    symbol={selectedStock.stockSymbol}
                    currentPrice={currentPrice}
                />

                <div className='stockConfig__action'
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 12,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}>
                    <Button
                        onClick={() => setSelectedStock(null)}
                    >
                        Cancel
                    </Button>

                    <Button
                        type='primary'
                        onClick={() => {
                            isEditing ?
                                handleUpdateBuyOrder() : handleSubmitBuyOrder();
                        }}
                    >
                        {isEditing ? 'Update' : 'Submit'} Buy Order
                    </Button>
                </div>
            </div>
        </Card>
    );
};
export default SelectStockConfig;