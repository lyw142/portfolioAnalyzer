import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Select, Space, Tooltip as TooltipA, Progress, Segmented } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, ReferenceLine, LabelList, Label, ResponsiveContainer, Tooltip } from "recharts";
import { notify } from '../../../../utils/notify';
import { getPortfolioRoute, getPortfoliosRoute, historicalPriceRoute } from '../../../../routes';
import axios from 'axios';
import Loading from '../../../Loading/Loading';
import Cookies from 'js-cookie';
import StockCard from '../../../Portfolios/components/StockCard/StockCard';
import { Link } from 'react-router-dom';
import DonutChart from '../../../Portfolios/components/PortfolioDetails/components/DonutChart/DonutChart';
import LineChart from '../../../Portfolios/components/PortfolioDetails/components/LineChart/LineChart';

const { Content } = Layout;

const formatLabel = (value) => {
    // format labels to 2dp
    return value.toFixed(1);
};

const PortfolioComparison = () => {

    // portfolio1 
    const [annualReturnData, setAnnualReturnData] = useState(null);
    const [annualizedReturnData, setAnnualizedReturnData] = useState(null);
    const [annualizedVolatilityData, setAnnualizedVolatilityData] = useState(null);
    const [annualizedVolatilityDaysData, setAnnualizedVolatilityDaysData] = useState(null);
    const [annualReturnYearOptions, setAnnualReturnYearOptions] = useState(null);
    const [annualReturnYearDefault, setAnnualReturnYearDefault] = useState(null);
    const [annualReturnDataSelected, setAnnualReturnDataSelected] = useState(null);
    const [amountPlaced1, setAmountPlaced1] = useState(null);
    const [availableAmount1, setAvailableAmount1] = useState(null);
    const [historicalPriceMonthly, setHistoricalPriceMonthly] = useState(null);
    const [historicalPriceDaily, setHistoricalPriceDaily] = useState(null); const [historicalRange, setHistoricalRange] = useState('Monthly');


    // portfolio2 
    const [annualReturnData2, setAnnualReturnData2] = useState(null);
    const [annualizedReturnData2, setAnnualizedReturnData2] = useState(null);
    const [annualizedVolatilityData2, setAnnualizedVolatilityData2] = useState(null);
    const [annualizedVolatilityDaysData2, setAnnualizedVolatilityDaysData2] = useState(null);
    const [annualReturnYearOptions2, setAnnualReturnYearOptions2] = useState(null);
    const [annualReturnYearDefault2, setAnnualReturnYearDefault2] = useState(null);
    const [annualReturnDataSelected2, setAnnualReturnDataSelected2] = useState(null);
    const [amountPlaced2, setAmountPlaced2] = useState(null);
    const [availableAmount2, setAvailableAmount2] = useState(null);
    const [historicalPriceMonthly2, setHistoricalPriceMonthly2] = useState(null);
    const [historicalPriceDaily2, setHistoricalPriceDaily2] = useState(null);
    const [historicalRange2, setHistoricalRange2] = useState('Monthly');

    const [isLoading, setIsLoading] = useState(false);
    const [portfolioOptions, setPortfolioOptions] = useState([]);

    const [portfolio1Data, setPortfolio1Data] = useState(null);
    const [portfolio2Data, setPortfolio2Data] = useState(null);

    useEffect(() => {
        if (!Cookies.get('email')) return;
        let email = Cookies.get('email');
        // Fetch list of portfolios from backend
        const fetchPortfolios = async (email) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${getPortfoliosRoute}/${email}`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch portfolios');
                    return;
                }

                const body = response.data;
                const options = body?.map((portfolio) => {
                    return (
                        {
                            label: portfolio['portfolioName'],
                            value: portfolio['portfolioId'],
                        }
                    );
                });

                setPortfolioOptions(options);
            } catch (err) {
                if (err.response && err.response.status === 404) { // no portfolios found
                    notify('error', 'No portfolios found');
                } else {
                    notify('error', 'Failed to fetch portfolios');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchPortfolios(email);
    }, []);

    useEffect(() => {
        if (!portfolio1Data) return;
        const placed = portfolio1Data.stockList.reduce((acc, stock) => {
            return acc + stock.qty * stock.currentStockPrice;
        }, 0);
        const available = portfolio1Data.capitalAmount - placed;

        setAmountPlaced1(placed.toFixed(2));
        setAvailableAmount1(available.toFixed(2));

    }, [portfolio1Data]);

    useEffect(() => {
        if (!portfolio2Data) return;
        const placed = portfolio2Data.stockList.reduce((acc, stock) => {
            return acc + stock.qty * stock.currentStockPrice;
        }, 0);
        const available = portfolio2Data.capitalAmount - placed;

        setAmountPlaced2(placed.toFixed(2));
        setAvailableAmount2(available.toFixed(2));

    }, [portfolio2Data]);

    useEffect(() => {
        if (!portfolio1Data) return;
        processData(portfolio1Data);
    }, [portfolio1Data]);

    useEffect(() => {
        if (!portfolio2Data) return;
        processData2(portfolio2Data);
    }, [portfolio2Data]);

    // portfolio 1
    const processData = (stockAnalyticsData) => {

        // annualReturns data 
        const annualReturnArray = Object.entries(stockAnalyticsData.annualReturn);
        // const annualReturn5yrArray = annualReturnArray.slice(-5);
        let annualReturnData = [];

        // converting to array of individual objects (format for rechart)
        for (let i = 0; i < annualReturnArray.length; i++) {
            const annualReturnObj = {
                year: annualReturnArray[i][0],
                annualReturn: annualReturnArray[i][1]
            };
            annualReturnData.push(annualReturnObj);
        }

        // format table data: annualizedReturn
        const annualizedReturnArray = Object.entries(stockAnalyticsData.annualizedReturn);
        let annualizedReturnData = [];

        // converting to array of individual objects (format for rechart)
        for (let i = 0; i < annualizedReturnArray.length; i++) {
            const annualizedReturnObj = {
                numYears: annualizedReturnArray[i][0].split(" ")[0],
                return: annualizedReturnArray[i][1].toFixed(2)
            };
            annualizedReturnData.push(annualizedReturnObj);
        }
        // sort according to years
        let sortedAnnualizedReturnData = annualizedReturnData.sort((data1, data2) => (parseInt(data1.numYears) > parseInt(data2.numYears)) ? 1 : (parseInt(data1.numYears) < parseInt(data2.numYears)) ? -1 : 0);


        // format table data: annualizedVolatilitymonths
        const annualizedVolatilityArray = Object.entries(stockAnalyticsData.annualizedVolatilityMonths);
        let annualizedVolatilityData = [];

        // converting to array of individual objects (format for rechart)
        for (let i = 0; i < annualizedVolatilityArray.length; i++) {
            const annualizedVolatilityObj = {
                numYears: annualizedVolatilityArray[i][0].split(" ")[0],
                volatility: annualizedVolatilityArray[i][1].toFixed(2)
            };
            annualizedVolatilityData.push(annualizedVolatilityObj);
        }
        // sort according to years
        let sortedAnnualizedVolatilityData = annualizedVolatilityData.sort((data1, data2) => (parseInt(data1.numYears) > parseInt(data2.numYears)) ? 1 : (parseInt(data1.numYears) < parseInt(data2.numYears)) ? -1 : 0);


        // converting to array of individual objects (format for rechart)
        let week1 = null;
        let week2 = null;
        let month1 = null;
        let month2 = null;
        let month3 = null;

        const annualizedVolatilityDaysArray = Object.entries(stockAnalyticsData.annualizedVolatilityDays);
        const annualizedVolatilityDaysData = [
            { timePeriod: "1 week", volatility: "-" },
            { timePeriod: "2 weeks", volatility: "-" },
            { timePeriod: "1 month", volatility: "-" },
            { timePeriod: "2 months", volatility: "-" },
            { timePeriod: "3 months", volatility: "-" }
        ];

        for (let i = 0; i < annualizedVolatilityDaysArray.length; i++) {

            let timePer = annualizedVolatilityDaysArray[i][0];
            let volVal = annualizedVolatilityDaysArray[i][1].toFixed(2);

            let objIndex = annualizedVolatilityDaysData.findIndex((obj => obj.timePeriod === timePer));
            annualizedVolatilityDaysData[objIndex].volatility = volVal;

        }

        // set all the data
        setAnnualReturnData(annualReturnData);
        setAnnualizedReturnData(sortedAnnualizedReturnData);
        setAnnualizedVolatilityData(sortedAnnualizedVolatilityData);
        setAnnualizedVolatilityDaysData(annualizedVolatilityDaysData);


        // set annualReturn selection options and default
        let annualReturnYearOptionsList = [];

        // if 5/less years of data, show all 
        if (annualReturnData.length <= 5) {

            // only option is show all data
            annualReturnYearOptionsList.push({ value: annualReturnData.length, label: annualReturnData.length });
            setAnnualReturnYearOptions(annualReturnYearOptionsList);

            // set default option 
            setAnnualReturnYearDefault(annualReturnData.length);
            setAnnualReturnDataSelected(annualReturnData);

            // // if more than 5
        } else {
            for (let i = 0; i < annualReturnData.length; i++) {

                // set year interval to 5 and max number of years displayed 20
                if (((i + 1) % 5) == 0 && (i + 1) <= 20) {
                    const obj = {
                        value: i + 1,
                        label: i + 1
                    };
                    annualReturnYearOptionsList.push(obj);
                }
                setAnnualReturnYearOptions(annualReturnYearOptionsList);
            }

            // set default option
            // let annualReturnYearDefault = 5;
            setAnnualReturnYearDefault(5);
            setAnnualReturnDataSelected(annualReturnData.slice(-5));
        }

        // set the options 
        setAnnualReturnYearOptions(annualReturnYearOptionsList);
    };

    // handle changes in selection (annualReturn data)
    const handleChange = (value) => {
        if (value < 5) {
            setAnnualReturnDataSelected(annualReturnData);
        } else {
            setAnnualReturnDataSelected(annualReturnData.slice(-value));
        }
    };

    // portfolio2
    const processData2 = (stockAnalyticsData2) => {
        // annualReturns data 
        const annualReturnArray2 = Object.entries(stockAnalyticsData2.annualReturn);
        // const annualReturn5yrArray = annualReturnArray.slice(-5);
        let annualReturnData2 = [];

        // converting to array of individual objects (format for rechart)
        for (let i = 0; i < annualReturnArray2.length; i++) {
            const annualReturnObj = {
                year: annualReturnArray2[i][0],
                annualReturn: annualReturnArray2[i][1]
            };
            annualReturnData2.push(annualReturnObj);
        }

        // format table data: annualizedReturn
        const annualizedReturnArray2 = Object.entries(stockAnalyticsData2.annualizedReturn);
        let annualizedReturnData2 = [];

        // converting to array of individual objects (format for rechart)
        for (let i = 0; i < annualizedReturnArray2.length; i++) {
            const annualizedReturnObj = {
                numYears: annualizedReturnArray2[i][0].split(" ")[0],
                return: annualizedReturnArray2[i][1].toFixed(2)
            };
            annualizedReturnData2.push(annualizedReturnObj);
        }
        // sort according to years
        let sortedAnnualizedReturnData2 = annualizedReturnData2.sort((data1, data2) => (parseInt(data1.numYears) > parseInt(data2.numYears)) ? 1 : (parseInt(data1.numYears) < parseInt(data2.numYears)) ? -1 : 0);

        // format table data: annualizedVolatilitymonths
        const annualizedVolatilityArray2 = Object.entries(stockAnalyticsData2.annualizedVolatilityMonths);
        let annualizedVolatilityData2 = [];

        // converting to array of individual objects (format for rechart)
        for (let i = 0; i < annualizedVolatilityArray2.length; i++) {
            const annualizedVolatilityObj = {
                numYears: annualizedVolatilityArray2[i][0].split(" ")[0],
                volatility: annualizedVolatilityArray2[i][1].toFixed(2)
            };
            annualizedVolatilityData2.push(annualizedVolatilityObj);
        }
        // sort according to years
        let sortedAnnualizedVolatilityData2 = annualizedVolatilityData2.sort((data1, data2) => (parseInt(data1.numYears) > parseInt(data2.numYears)) ? 1 : (parseInt(data1.numYears) < parseInt(data2.numYears)) ? -1 : 0);


        // converting to array of individual objects (format for rechart)
        let week1 = null;
        let week2 = null;
        let month1 = null;
        let month2 = null;
        let month3 = null;

        const annualizedVolatilityDaysArray2 = Object.entries(stockAnalyticsData2.annualizedVolatilityDays);
        const annualizedVolatilityDaysData2 = [
            { timePeriod: "1 week", volatility: "-" },
            { timePeriod: "2 weeks", volatility: "-" },
            { timePeriod: "1 month", volatility: "-" },
            { timePeriod: "2 months", volatility: "-" },
            { timePeriod: "3 months", volatility: "-" }
        ];

        for (let i = 0; i < annualizedVolatilityDaysArray2.length; i++) {

            let timePer = annualizedVolatilityDaysArray2[i][0];
            let volVal = annualizedVolatilityDaysArray2[i][1].toFixed(2);

            let objIndex = annualizedVolatilityDaysData2.findIndex((obj => obj.timePeriod == timePer));
            annualizedVolatilityDaysData2[objIndex].volatility = volVal;

        }

        // set all the data
        setAnnualReturnData2(annualReturnData2);
        setAnnualizedReturnData2(sortedAnnualizedReturnData2);
        setAnnualizedVolatilityData2(sortedAnnualizedVolatilityData2);
        setAnnualizedVolatilityDaysData2(annualizedVolatilityDaysData2);


        // set annualReturn selection options and default
        let annualReturnYearOptionsList2 = [];

        // if 5/less years of data, show all 
        if (annualReturnData2.length <= 5) {

            // only option is show all data
            annualReturnYearOptionsList2.push({ value: annualReturnData2.length, label: annualReturnData2.length });
            setAnnualReturnYearOptions2(annualReturnYearOptionsList2);

            // set default option 
            setAnnualReturnYearDefault2(annualReturnData2.length);
            setAnnualReturnDataSelected2(annualReturnData2);
            // // if more than 5
        } else {
            for (let i = 0; i < annualReturnData2.length; i++) {

                // set year interval to 5 and max number of years displayed 20
                if (((i + 1) % 5) == 0 && (i + 1) <= 20) {
                    const obj = {
                        value: i + 1,
                        label: i + 1
                    };
                    annualReturnYearOptionsList2.push(obj);
                }
                setAnnualReturnYearOptions2(annualReturnYearOptionsList2);
            }

            // set default option
            // let annualReturnYearDefault = 5;
            setAnnualReturnYearDefault2(5);
            setAnnualReturnDataSelected2(annualReturnData2.slice(-5));
        }

        // set the options 
        setAnnualReturnYearOptions2(annualReturnYearOptionsList2);
    };

    // handle changes in selection (annualReturn data)
    const handleChange2 = (value) => {
        if (value < 5) {
            setAnnualReturnDataSelected2(annualReturnData2);
        } else {
            setAnnualReturnDataSelected2(annualReturnData2.slice(-value));
        }
    };

    // set column headers of tables
    const annualizedReturnColumns = [
        {
            title: 'Number of years',
            dataIndex: 'numYears',
            key: 'numYears',
        },
        {
            title: 'Return (%)',
            dataIndex: 'return',
            key: 'return',
        }
    ];

    const annualizedVolatilityColumns = [
        {
            title: 'Number of years',
            dataIndex: 'numYears',
            key: 'numYears',
        },
        {
            title: 'Volatility (%)',
            dataIndex: 'volatility',
            key: 'volatility',
        }
    ];

    const annualizedVolatilityDaysColumns = [
        {
            title: 'Time Period',
            dataIndex: 'timePeriod',
            key: 'timePeriod',
        },
        {
            title: 'Volatility (%)',
            dataIndex: 'volatility',
            key: 'volatility',
        }
    ];

    const filterOption = (input, option) =>
        (option?.value ?? '').toLowerCase().includes(input.toLowerCase());


    const onSelectPortfolio1 = (portfolioOption) => {
        const fetchPortfolio = async (portfolioID) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${getPortfolioRoute}/${portfolioID}`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch portfolio');
                    return;
                }

                const body = response.data;
                setPortfolio1Data(body);
            } catch (err) {
                notify('error', 'Failed to fetch portfolio');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchHistoricalPriceMonthly = async (portfolioID) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${historicalPriceRoute}/${portfolioID}/historicalPricePercentageChange/monthly`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch historical price - Monthly');
                    return;
                }
                const body = response.data;
                setHistoricalPriceMonthly(body);
            } catch (err) {
                notify('error', 'Failed to fetch historical price - Monthly');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchHistoricalPriceDaily = async (portfolioID) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${historicalPriceRoute}/${portfolioID}/historicalPricePercentageChange/daily`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch historical price - Daily');
                    return;
                }
                const body = response.data;
                setHistoricalPriceDaily(body);
            } catch (err) {
                notify('error', 'Failed to fetch historical price - Daily');
            } finally {
                setIsLoading(false);
            }
        };

        const portfolioId = portfolioOption.value;
        fetchPortfolio(portfolioId);
        fetchHistoricalPriceMonthly(portfolioId);
        fetchHistoricalPriceDaily(portfolioId);
    };

    const onSelectPortfolio2 = (portfolioOption) => {
        const fetchPortfolio = async (portfolioID) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${getPortfolioRoute}/${portfolioID}`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch portfolio');
                    return;
                }
                const body = response.data;
                setPortfolio2Data(body);
            } catch (err) {
                notify('error', 'Failed to fetch portfolio');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchHistoricalPriceMonthly = async (portfolioID) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${historicalPriceRoute}/${portfolioID}/historicalPricePercentageChange/monthly`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch historical price - Monthly');
                    return;
                }
                const body = response.data;
                setHistoricalPriceMonthly2(body);
            } catch (err) {
                notify('error', 'Failed to fetch historical price - Monthly');
            } finally {
                setIsLoading(false);
            }
        };

        const fetchHistoricalPriceDaily = async (portfolioID) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${historicalPriceRoute}/${portfolioID}/historicalPricePercentageChange/daily`);

                if (response.status !== 200) {
                    notify('error', 'Failed to fetch historical price - Daily');
                    return;
                }
                const body = response.data;
                setHistoricalPriceDaily2(body);
            } catch (err) {
                notify('error', 'Failed to fetch historical price - Daily');
            } finally {
                setIsLoading(false);
            }
        };

        const portfolioId = portfolioOption.value;
        fetchPortfolio(portfolioId);
        fetchHistoricalPriceMonthly(portfolioId);
        fetchHistoricalPriceDaily(portfolioId);
    };

    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >
            <div style={{
                fontSize: '22px',
                fontWeight: '600',
                margin: '12px auto',
            }}>Portfolio Comparison</div>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'centers',
                gap: '20px',
            }}>
                <div style={{
                    width: '50%',
                }}>
                    <div style={{
                        marginBottom: '30px'
                    }}>
                        Portfolio 1:
                        <Select
                            showSearch
                            placeholder="Choose Portfolio"
                            options={portfolioOptions}
                            style={{
                                width: '100%',
                            }}
                            size='large'
                            labelInValue
                            filterOption={filterOption}
                            onChange={onSelectPortfolio1}
                        />
                    </div>
                </div>
                <div style={{
                    width: '50%',
                }}>
                    <div style={{
                        marginBottom: '30px'
                    }}>
                        Portfolio 2:
                        <Select
                            showSearch
                            placeholder="Choose Portfolio"
                            options={portfolioOptions}
                            style={{
                                width: '100%',
                            }}
                            size='large'
                            labelInValue
                            filterOption={filterOption}
                            onChange={onSelectPortfolio2}
                        />
                    </div>
                </div>
            </div>

            {portfolio1Data && portfolio2Data ?
                <>
                    {/* Portfolio Information */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <h2>{portfolio1Data.portfolioName}</h2>
                            <Card title="Portfolio Information">
                                <b>Capital Amount</b>: {portfolio1Data.capitalAmount} <br></br>
                                <b>Strategy</b>: {portfolio1Data.portfolioStrategy} <br></br>
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>
                            <h2>{portfolio2Data.portfolioName}</h2>
                            <Card title="Portfolio Information">
                                <b>Capital Amount</b>: {portfolio2Data.capitalAmount} <br></br>
                                <b>Strategy</b>: {portfolio2Data.portfolioStrategy} <br></br>
                            </Card>
                        </div>
                    </div>

                    {/* Capital Amount */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card
                                style={{
                                    height: '225px',
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
                                        <span>{portfolio1Data && `$${portfolio1Data.capitalAmount}`}</span>
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
                                        <span>${availableAmount1}</span>
                                    </div>
                                    <div className="balance__content"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                        <span style={{
                                            fontWeight: 500
                                        }}>Placed</span>
                                        <span>${amountPlaced1}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div style={{
                            width: '50%',
                        }}>
                            <Card
                                style={{
                                    height: '225px',
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
                                        <span>{portfolio2Data && `$${portfolio2Data.capitalAmount}`}</span>
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
                                        <span>${availableAmount2}</span>
                                    </div>
                                    <div className="balance__content"
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                        <span style={{
                                            fontWeight: 500
                                        }}>Placed</span>
                                        <span>${amountPlaced2}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Historical Price */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
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

                        <div style={{
                            width: '50%',
                        }}>
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
                                    value={historicalRange2}
                                    onChange={setHistoricalRange2} />

                                <LineChart
                                    dataset={historicalRange2 === 'Monthly' ? historicalPriceMonthly2 : historicalPriceDaily2}
                                    type={historicalRange2}
                                />
                            </Card>
                        </div>
                    </div>

                    {/* Annual Return */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    {"Annual Return "}
                                    <TooltipA title="Annual return is the percentage change in the value of an investment over a one-year period, representing the gain or loss made during that time.">
                                        <QuestionCircleOutlined />
                                    </TooltipA>
                                </span>
                            }>
                                <Space wrap> Number of years displayed:
                                    <Select
                                        defaultValue={annualReturnYearDefault}
                                        style={{
                                            width: 120,
                                        }}
                                        onChange={handleChange}
                                        options={annualReturnYearOptions}
                                    />
                                </Space>
                                <ResponsiveContainer aspect={1.25}>
                                    <BarChart data={annualReturnDataSelected} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={50}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year">
                                            <Label value="Annual Return (%)" offset={0} position="bottom" />
                                        </XAxis>
                                        <YAxis type="number" domain={['dataMin - 50', 'auto']} />
                                        {/* <YAxis type="number" tickCount={5} interval={0} domain={([dataMin, dataMax]) => { const min = parseInt(dataMin) - 10; const max = parseInt(dataMax) + 10; return [min, max]; }}/> */}
                                        <Tooltip />
                                        <Bar dataKey="annualReturn" fill="#8884d8">
                                            <LabelList dataKey="annualReturn" position="top" formatter={formatLabel} />
                                        </Bar>
                                        <ReferenceLine y={0} stroke="#000" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    {"Annual Return "}
                                    <TooltipA title="Annual return is the percentage change in the value of an investment over a one-year period, representing the gain or loss made during that time.">
                                        <QuestionCircleOutlined />
                                    </TooltipA>
                                </span>
                            }>
                                <Space wrap> Number of years displayed:
                                    <Select
                                        defaultValue={annualReturnYearDefault2}
                                        style={{
                                            width: 120,
                                        }}
                                        onChange={handleChange2}
                                        options={annualReturnYearOptions2}
                                    />
                                </Space>
                                <ResponsiveContainer aspect={1.25}>
                                    <BarChart data={annualReturnDataSelected2} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={50}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year">
                                            <Label value="Annual Return (%)" offset={0} position="bottom" />
                                        </XAxis>
                                        <YAxis type="number" domain={['dataMin - 50', 'auto']} />
                                        {/* <Legend /> */}
                                        <Tooltip />
                                        <Bar dataKey="annualReturn" fill="#FF8042">
                                            <LabelList dataKey="annualReturn" position="top" formatter={formatLabel} />
                                        </Bar>
                                        <ReferenceLine y={0} stroke="#000" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>

                    {/* Annualized Return */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    {"Annualized Return "}
                                    <TooltipA title="Annualized return is a measure of an investment's average annual growth rate over a period of time that may be longer or shorter than one year. It provides a way to compare the performance of investments with different timeframes by annualizing the returns, making them directly comparable on an annual basis.">
                                        <QuestionCircleOutlined />
                                    </TooltipA>
                                </span>
                            }>
                                <Table dataSource={annualizedReturnData} columns={annualizedReturnColumns} pagination={false} />
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    {"Annualized Return "}
                                    <TooltipA title="Annualized return is a measure of an investment's average annual growth rate over a period of time that may be longer or shorter than one year. It provides a way to compare the performance of investments with different timeframes by annualizing the returns, making them directly comparable on an annual basis.">
                                        <QuestionCircleOutlined />
                                    </TooltipA>
                                </span>
                            }>
                                <Table dataSource={annualizedReturnData2} columns={annualizedReturnColumns} pagination={false} />
                            </Card>
                        </div>
                    </div>

                    {/* Annualized Volatility */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    {"Annualized Volatility "}
                                    <TooltipA title="Annualized volatility is a measure of the variation in the returns of an investment over a year. It quantifies the degree of risk or price fluctuations associated with the investment on an annualized basis, helping one to assess its stability and potential for both gains and losses.">
                                        <QuestionCircleOutlined />
                                    </TooltipA>
                                </span>
                            }>
                                <Card type="inner" title="Annualized Volatility (Yearly)">
                                    Annualized Volatility by years uses monthly stock data.
                                    <br></br><br></br>
                                    <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false} />
                                </Card>
                                <Card type="inner" title="Annualized Volatility (Shorter time periods: Week, Months)">
                                    Annualized Volatility for shorter time periods such as weeks and months uses daily stock data which may be more accurate than the monthly data.
                                    <br></br><br></br>
                                    <Table dataSource={annualizedVolatilityDaysData} columns={annualizedVolatilityDaysColumns} pagination={false} />
                                </Card>
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    {"Annualized Volatility "}
                                    <TooltipA title="Annualized volatility is a measure of the variation in the returns of an investment over a year. It quantifies the degree of risk or price fluctuations associated with the investment on an annualized basis, helping one to assess its stability and potential for both gains and losses.">
                                        <QuestionCircleOutlined />
                                    </TooltipA>
                                </span>
                            }>
                                <Card type="inner" title="Annualized Volatility (Yearly)">
                                    Annualized Volatility by years uses monthly stock data.
                                    <br></br><br></br>
                                    <Table dataSource={annualizedVolatilityData2} columns={annualizedVolatilityColumns} pagination={false} />
                                </Card>
                                <Card type="inner" title="Annualized Volatility (Shorter time periods: Week, Months)">
                                    Annualized Volatility for shorter time periods such as weeks and months uses daily stock data which may be more accurate than the monthly data.
                                    <br></br><br></br>
                                    <Table dataSource={annualizedVolatilityDaysData2} columns={annualizedVolatilityDaysColumns} pagination={false} />
                                </Card>
                            </Card>
                        </div>
                    </div>

                    {/* Stocks */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    Stocks
                                </span>
                            }>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {
                                        portfolio1Data && portfolio1Data.combinedStockList.map((stock, index) => {
                                            return (
                                                <Link
                                                    to={`/stockAnalytics/${stock.stockSymbol}`}
                                                    state={{ stockSymbol: stock.stockSymbol }}
                                                    key={index}>
                                                    <StockCard
                                                        key={index}
                                                        stock={stock}
                                                        showPercentage={true}
                                                        percentage={portfolio1Data && portfolio1Data.percentAllocated[stock.stockSymbol]}
                                                    />
                                                </Link>
                                            );
                                        })
                                    }
                                </div>
                            </Card>
                        </div>

                        <div style={{
                            width: '50%',
                        }}>
                            <Card title={
                                <span>
                                    Stocks
                                </span>
                            }>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {
                                        portfolio2Data && portfolio2Data.combinedStockList.map((stock, index) => {
                                            return (
                                                <Link
                                                    to={`/stockAnalytics/${stock.stockSymbol}`}
                                                    state={{ stockSymbol: stock.stockSymbol }}
                                                    key={index}>
                                                    <StockCard
                                                        key={index}
                                                        stock={stock}
                                                        showPercentage={true}
                                                        percentage={portfolio2Data && portfolio2Data.percentAllocated[stock.stockSymbol]}
                                                    />
                                                </Link>
                                            );
                                        })
                                    }
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Industry Allocation */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card style={{
                                flex: 1
                            }}>
                                <div style={{
                                    fontSize: 20,
                                    marginBottom: 20
                                }}>Industry Allocation</div>
                                <DonutChart
                                    type={'industry'}
                                    allocation={portfolio1Data && portfolio1Data.industryAllocated}
                                    legendPosition={'top'}
                                />
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>
                            <Card style={{
                                flex: 1
                            }}>
                                <div style={{
                                    fontSize: 20,
                                    marginBottom: 20
                                }}>Industry Allocation</div>
                                <DonutChart
                                    type={'industry'}
                                    allocation={portfolio2Data && portfolio2Data.industryAllocated}
                                    legendPosition={'top'}
                                />
                            </Card>
                        </div>
                    </div>

                    {/* Sector Allocation */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'centers',
                        gap: '20px',
                        marginBottom: '20px',
                    }}>
                        <div style={{
                            width: '50%',
                        }}>

                            <Card style={{
                                flex: 1
                            }}>
                                <div style={{
                                    fontSize: 20,
                                    marginBottom: 20
                                }}>Sector Allocation</div>
                                <DonutChart
                                    type={'sector'}
                                    allocation={portfolio1Data && portfolio1Data.sectorAllocated}
                                    legendPosition={'top'}
                                />
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>

                            <Card style={{
                                flex: 1
                            }}>
                                <div style={{
                                    fontSize: 20,
                                    marginBottom: 20
                                }}>Sector Allocation</div>
                                <DonutChart
                                    type={'sector'}
                                    allocation={portfolio2Data && portfolio2Data.sectorAllocated}
                                    legendPosition={'top'}
                                />
                            </Card>
                        </div>
                    </div>
                </>
                : isLoading ?
                    <Loading height={'65vh'} />
                    :
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '70vh',
                        flexDirection: 'column',
                    }}>
                        <div style={{
                            width: '25vw'
                        }}>
                            <Progress showInfo={false}
                                percent={
                                    portfolio1Data && portfolio2Data ?
                                        100
                                        : portfolio1Data || portfolio2Data ? 50 : 0
                                } />
                        </div>
                        Select two portfolios to get started!
                    </div>
            }
        </Content>


    );

};
export default PortfolioComparison;