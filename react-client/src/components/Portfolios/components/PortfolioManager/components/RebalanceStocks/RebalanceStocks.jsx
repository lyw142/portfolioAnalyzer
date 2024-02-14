import React, { useEffect, useState } from 'react';
import { Button, List, Modal, Typography } from 'antd';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { getStockByStockSymbol, rebalancePortfolioRoute } from '../../../../../../routes';
import { notify } from '../../../../../../utils/notify';
import Loading from '../../../../../Loading/Loading';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
const { Text } = Typography;

const RebalanceStocks = ({ portfolioId, combinedStockList, existingStocks, setExistingStocks, setStocksToAdd, setStocksToDelete, stocksToDelete }) => {

    const [rebalanceMapping, setRebalanceMapping] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const showRebalanceModal = () => {
        setOpen(true);
        fetchRebalanceStocks();
    };

    const fetchStock = async (symbol) => {
        try {
            const response = await axios.get(`${getStockByStockSymbol}/${symbol}`);
            if (response.status !== 200) return;
            const body = response.data;
            return body;
        } catch (err) {
            notify('error', 'Error fetching stock');
        } finally {

        }
    };

    const handleRebalanceStock = async (stockSymbol, rebalanceQty) => {
        try {
            // remove all stock of that symbol from exisitng stocks
            // clone existingStocks
            const updatedStocksToDelete = existingStocks.filter((stock) => stock.stockSymbol === stockSymbol);
            setStocksToDelete(prevStocksToDelete => [
                ...prevStocksToDelete,
                ...updatedStocksToDelete
            ]);

            // update existing stocks
            setExistingStocks(prevState => prevState.filter((stock) => stock.stockSymbol !== stockSymbol));

            // fetch that specific stock
            const stock = await fetchStock(stockSymbol);

            let buyOrder = {
                stockSymbol: stockSymbol,
                stockName: stock.stockName,
                qty: rebalanceQty,
                currentStockPrice: stock.currentStockPrice,
                exchange: stock.exchange
            };
            setStocksToAdd(prevStocksToAdd => [
                ...prevStocksToAdd,
                buyOrder
            ]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleConfirmRebalance = async () => {
        try {
            setConfirmLoading(true);

            // if there are stocksToDelete, shift then back to existingStocks 
            setExistingStocks(prevState => [
                ...prevState,
                ...stocksToDelete
            ]);

            setStocksToAdd([]);
            // setStocksToDelete([]);

            for (let i = 0; i < rebalanceMapping.length; i++) {
                const stock = rebalanceMapping[i];
                if (stock.diff === 0) continue;
                await handleRebalanceStock(stock.stockSymbol, stock.rebalance);
            }
        } finally {
            setConfirmLoading(false);
            setOpen(false);
        }
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const fetchRebalanceStocks = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${rebalancePortfolioRoute}/${portfolioId}/rebalancedPortfolio`);
            if (response.status !== 200) {
                notify('error', 'Error fetching rebalance stocks');
                return;
            }
            const body = response.data;

            let stockRebalanceMapping = [];

            Object.keys(body).forEach((stock) => {
                const stockObj = combinedStockList.find((stockObj) => stockObj.stockSymbol === stock);
                stockRebalanceMapping.push({
                    stockSymbol: stock,
                    current: stockObj?.qty,
                    rebalance: body[stock],
                    diff: body[stock] - stockObj?.qty
                });
            });
            setRebalanceMapping(stockRebalanceMapping);
        } catch (error) {
            notify('error', 'Error fetching rebalance stocks');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button onClick={showRebalanceModal} type='primary'>Rebalance</Button>
            <Modal
                centered
                title="Rebalancing my Stocks"
                open={open}
                onOk={handleConfirmRebalance}
                okText="Apply"
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                {
                    isLoading ?
                        <Loading /> :
                        <>
                            <List
                                bordered
                                dataSource={rebalanceMapping}
                                renderItem={(item) => (
                                    <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #e8e8e8' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%'
                                        }}>
                                            {/* Stock Symbol */}
                                            <Text style={{ margin: '0 16px' }}>{item.stockSymbol}</Text>

                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginRight: '16px'
                                            }}>
                                                {/* Quantity */}
                                                <Text style={{ marginRight: '16px' }}>Current Qty: {item.current}</Text>

                                                {/* Change in Quantity */}
                                                <div style={{ color: item.diff >= 0 ? 'green' : 'red', display: 'flex', alignItems: 'center' }}>
                                                    {item.diff > 0 ? (
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <CaretUpOutlined style={{ color: 'green', marginRight: '4px' }} />
                                                            <Text style={{ color: 'green' }}>{item.diff}</Text>

                                                            <Text style={{ marginLeft: '8px' }}>Rebalance to: {item.rebalance}</Text>
                                                        </div>
                                                    ) : item.diff < 0 ? (
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            <CaretDownOutlined style={{ color: 'red', marginRight: '4px' }} />
                                                            <Text style={{ color: 'red' }}>{item.diff}</Text>

                                                            <Text style={{ marginLeft: '8px' }}>Rebalance to: {item.rebalance}</Text>
                                                        </div>
                                                    ) : (
                                                        <Text>No Change</Text>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </>
                }
            </Modal >
        </>
    );
};
export default RebalanceStocks;