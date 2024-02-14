import React, { useMemo, useState, useEffect } from 'react';
import Loading from '../../../../../Loading/Loading';
import CandlestickChart from './CandlestickChart';
import axios from 'axios';
import { notify } from '../../../../../../utils/notify';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import stockVMockData from '../../../../../../mockData/stockVMockData.json';

const StockInfo = ({ symbol, currentPrice }) => {

    const [isLoading, setIsLoading] = useState(true);
    const [stockData, setStockData] = useState(null);
    // stockData holds an object with 2 keys: "Meta Data" and "Weekly Adjusted Time Series"
    // {
    //     "Meta Data": {},
    //     "Weekly Adjusted Time Series": {}
    // }

    useEffect(() => {
        fetchStockTimeSeriesData(symbol);
    }, [symbol]);

    // time series weekly adjusted data
    const fetchStockTimeSeriesData = async (symbol) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY_ADJUSTED&symbol=${symbol}&apikey=J2R0P9ISWGVPDZN9`);

            if (response.status !== 200 || !response.data) {
                console.error('Error fetching stock data');
                notify('error', 'Error fetching stock data');
                return;
            }
            setStockData(response.data);
        } catch (err) {
            notify('error', 'Error fetching stock data');
        } finally {
            setIsLoading(false);
        }
    };

    const formatStockData = (stockData) => {
        const formattedData = [];
        if (stockData && stockData['Weekly Adjusted Time Series']) {
            const timeSeries = stockData['Weekly Adjusted Time Series'];
            const entries = Object.entries(timeSeries);
            let last100Entries = entries.slice(0, 100).reverse();
            last100Entries.forEach(
                ([key, value]) => {
                    formattedData.push({
                        x: key,
                        y: [
                            value['1. open'],
                            value['2. high'],
                            value['3. low'],
                            value['4. close'],
                        ]
                    });
                }
            );
        }
        return formattedData;
    };

    const getMetaData = (stockData) => {
        if (stockData && stockData['Meta Data']) {
            return stockData['Meta Data'];
        }
    };

    const seriesData = useMemo(() => formatStockData(stockData), [stockData]);
    const metaData = useMemo(() => getMetaData(stockData), [stockData]);

    if (isLoading || !stockData || !metaData) return <Loading />;
    return (
        <div className="StockInfo"
            style={{
                display: 'flex',
                flexDirection: 'column',
                margin: '24px 0px',
            }}>
            <div className='StockInfo__metaData'
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%'
                }}>
                <div style={{
                    fontSize: '24px',
                    fontWeight: 500,
                    display: 'flex',
                    justifyContent: 'space-between',
                }}>
                    {metaData['2. Symbol']}
                    <span>${currentPrice.toFixed(2)}</span>
                </div>
                <div style={{
                    fontSize: '18px',
                }}>
                    {metaData['1. Information']}
                </div>
                <div style={{
                    fontSize: '14px',
                    opacity: 0.75
                }}>
                    {metaData['3. Last Refreshed']}{' '}
                    {metaData['4. Time Zone']}
                </div>

            </div>
            <CandlestickChart seriesData={seriesData} />
        </div>

    );
};
export default StockInfo;