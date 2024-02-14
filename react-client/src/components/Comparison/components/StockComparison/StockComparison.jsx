import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Layout, Card, Table, Select, Space, Tooltip as TooltipA, Col, Row, Progress } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import stockAnalyticsDataJson from "../../../../mockData/stockAnalytics.json";
import stockAnalyticsDataJson2 from "../../../../mockData/stockAnalytics2.json";
import { BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, ReferenceLine, LabelList, Label, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import { notify } from '../../../../utils/notify';
import { getAllStocksRoute, getStockByStockSymbol } from '../../../../routes';
import axios from 'axios';
import Loading from '../../../Loading/Loading';

// import StockAnalytics from '../StockAnalytics/StockAnalytics';

const { Content } = Layout;

const formatLabel = (value) => {
    // format labels to 2dp
    return value.toFixed(1);
};

const StockComparison = () => {

    // portfolio1 
    const [annualReturnData, setAnnualReturnData] = useState(null);
    const [annualizedReturnData, setAnnualizedReturnData] = useState(null);
    const [annualizedVolatilityData, setAnnualizedVolatilityData] = useState(null);
    const [annualizedVolatilityDaysData, setAnnualizedVolatilityDaysData] = useState(null);
    const [annualReturnYearOptions, setAnnualReturnYearOptions] = useState(null);
    const [annualReturnYearDefault, setAnnualReturnYearDefault] = useState(null);
    const [annualReturnDataSelected, setAnnualReturnDataSelected] = useState(null);

    // portfolio2 
    const [annualReturnData2, setAnnualReturnData2] = useState(null);
    const [annualizedReturnData2, setAnnualizedReturnData2] = useState(null);
    const [annualizedVolatilityData2, setAnnualizedVolatilityData2] = useState(null);
    const [annualizedVolatilityDaysData2, setAnnualizedVolatilityDaysData2] = useState(null);
    const [annualReturnYearOptions2, setAnnualReturnYearOptions2] = useState(null);
    const [annualReturnYearDefault2, setAnnualReturnYearDefault2] = useState(null);
    const [annualReturnDataSelected2, setAnnualReturnDataSelected2] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [stockOptions, setStockOptions] = useState([]);

    const [stock1Data, setStock1Data] = useState(null);
    const [stock2Data, setStock2Data] = useState(null);

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
            } catch (error) {
                notify('error', 'Error fetching stocks');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStocks();
    }, []);

    useEffect(() => {
        if (!stock1Data) return;
        processData(stock1Data);
    }, [stock1Data]);

    useEffect(() => {
        if (!stock2Data) return;
        processData2(stock2Data);
    }, [stock2Data]);

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
        (option?.value ?? '').toLowerCase().includes(input.toLowerCase()) || (option?.title ?? '').toLowerCase().includes(input.toLowerCase());

    const onSelectStock1 = (stockOption) => {
        // Fetch single stock to get latest stock price
        const fetchStock = async (symbol) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${getStockByStockSymbol}/${symbol}`);
                if (response.status !== 200) return;
                const body = response.data;
                setStock1Data(body);
            } catch (err) {
                notify('error', 'Error fetching stock 1');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStock(stockOption.key);
    };

    const onSelectStock2 = (stockOption) => {
        // Fetch single stock to get latest stock price
        const fetchStock = async (symbol) => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${getStockByStockSymbol}/${symbol}`);
                if (response.status !== 200) return;
                const body = response.data;
                setStock2Data(body);
            } catch (err) {
                notify('error', 'Error fetching stock 2');
            } finally {
                setIsLoading(false);
            }
        };
        fetchStock(stockOption.key);
    };

    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >
            {/* <h2>Stock Comparison</h2> */}
            <div style={{
                fontSize: '22px',
                fontWeight: '600',
                margin: '12px auto',
            }}>Stock Comparison</div>
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
                        Stock 1:
                        <Select
                            showSearch
                            placeholder="Choose stock"
                            options={stockOptions}
                            style={{
                                width: '100%',
                            }}
                            size='large'
                            labelInValue
                            filterOption={filterOption}
                            onChange={onSelectStock1}
                        />
                    </div>
                </div>
                <div style={{
                    width: '50%',
                }}>
                    <div style={{
                        marginBottom: '30px'
                    }}>
                        {"Stock 2: "}
                        <Select
                            showSearch
                            placeholder="Choose stock"
                            options={stockOptions}
                            style={{
                                width: '100%',
                            }}
                            size='large'
                            labelInValue
                            filterOption={filterOption}
                            onChange={onSelectStock2}
                        />
                    </div>
                </div>
            </div>

            {stock1Data && stock2Data ?
                <>
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
                            <h2>{stock1Data.stockSymbol}</h2>
                            <Card title="Stock Information">
                                {/* <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false}/> */}
                                <b>Stock symbol</b>: {stock1Data.stockSymbol} <br></br>
                                <b>Stock name</b>: {stock1Data.stockName} <br></br>
                                <b>Country</b>: {stock1Data.country} <br></br>
                                <b>Sector</b>: {stock1Data.sector} <br></br>
                                <b>Exchange</b>: {stock1Data.exchange} <br></br>
                                <b>Industry</b>: {stock1Data.industry} <br></br>
                                <br></br>
                                <b>Description</b>:
                                <br></br>
                                {stock1Data.stockDescription}
                            </Card>
                        </div>
                        <div style={{
                            width: '50%',
                        }}>
                            <h2>{stock2Data.stockSymbol}</h2>
                            <Card title="Stock Information">
                                {/* <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false}/> */}
                                <b>Stock symbol</b>: {stock2Data.stockSymbol} <br></br>
                                <b>Stock name</b>: {stock2Data.stockName} <br></br>
                                <b>Country</b>: {stock2Data.country} <br></br>
                                <b>Sector</b>: {stock2Data.sector} <br></br>
                                <b>Exchange</b>: {stock2Data.exchange} <br></br>
                                <b>Industry</b>: {stock2Data.industry} <br></br>
                                <br></br>
                                <b>Description</b>:
                                <br></br>
                                {stock2Data.stockDescription}
                            </Card>
                        </div>
                    </div>
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
                                {/* <ResponsiveContainer aspect={1.25}>

                            <LineChart data={annualReturnDataSelected2} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" />
                                    <Label value="Annual Return (%)" offset={10} position="bottom" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="annualReturn" stroke="#8884d8">
                                    <LabelList dataKey="annualReturn" position="top" formatter={formatLabel}/>
                                </Line>
                            </LineChart>
                        </ResponsiveContainer> */}
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
                                    stock1Data && stock2Data ?
                                        100
                                        : stock1Data || stock2Data ? 50 : 0
                                } />
                        </div>
                        Select two stocks to get started!
                    </div>
            }


            {/* ORIGINAL BELOW */}
            {/* <div style={{
                display: 'flex', 
                flexDirection: 'row', 
                width: '100%', 
                justifyContent:'centers', 
                gap:'20px',
                marginBottom: '20px', 
            }}>
                
                <div style={{
                    width: '50%', 
                }}>
                    <h1> {stockSymbol}</h1>
                    <Card title="Stock Information">
                        <b>Stock symbol</b>: {stockSymbol} <br></br>
                        <b>Stock name</b>: {stockName} <br></br>
                        <b>Country</b>: {country} <br></br>
                        <b>Sector</b>: {sector} <br></br>
                        <b>Exchange</b>: {exchange} <br></br>
                        <b>Industry</b>: {industry} <br></br>
                        <br></br>
                        <b>Description</b>: 
                        <br></br>
                        {description}
                    </Card> 
                    <Card title={
                        <span>
                            {"Annual Return "}
                            <Tooltip title="Annual return is the percentage change in the value of an investment over a one-year period, representing the gain or loss made during that time.">
                            <QuestionCircleOutlined />
                        </Tooltip>
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
                            <BarChart data={annualReturnDataSelected} margin={{top: 20, right: 30, left: 20, bottom: 20}} barSize={50}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year">
                                    <Label value="Annual Return (%)" offset={0} position="bottom" />
                                </XAxis>
                                <YAxis />
                                <Bar dataKey="annualReturn" fill="#8884d8">
                                    <LabelList dataKey="annualReturn" position="top" formatter={formatLabel}/>
                                </Bar>
                                <ReferenceLine y={0} stroke="#000" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title={
                        <span>
                            {"Annualized Return "}
                            <Tooltip title="Annualized return is a measure of an investment's average annual growth rate over a period of time that may be longer or shorter than one year. It provides a way to compare the performance of investments with different timeframes by annualizing the returns, making them directly comparable on an annual basis.">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </span>
                    }>     
                        <Table dataSource={annualizedReturnData} columns={annualizedReturnColumns} pagination={false} />
                    </Card>
                    <Card title={
                        <span>
                            {"Annualized Volatility "}
                            <Tooltip title="Annualized volatility is a measure of the variation in the returns of an investment over a year. It quantifies the degree of risk or price fluctuations associated with the investment on an annualized basis, helping one to assess its stability and potential for both gains and losses.">
                            <QuestionCircleOutlined />
                        </Tooltip>
                        </span>
                    }>   
                        <Card type="inner" title="Annualized Volatility (Yearly)">
                            Annualized Volatility by years uses monthly stock data. 
                            <br></br><br></br>
                            <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false}/>
                        </Card>
                        <Card type="inner" title="Annualized Volatility (Shorter time periods: Week, Months)">
                            Annualized Volatility for shorter time periods such as weeks and months uses daily stock data which may be more accurate than the monthly data.
                            <br></br><br></br>
                            <Table dataSource={annualizedVolatilityDaysData} columns={annualizedVolatilityDaysColumns} pagination={false}/>
                        </Card>
                    </Card>
                </div>

                <div style={{
                    width: '50%', 
                }}>
                    <h1> {stockSymbol2}</h1>
                    <Card title="Stock Information">
                        <b>Stock symbol</b>: {stockSymbol2} <br></br>
                        <b>Stock name</b>: {stockName2} <br></br>
                        <b>Country</b>: {country2} <br></br>
                        <b>Sector</b>: {sector2} <br></br>
                        <b>Exchange</b>: {exchange2} <br></br>
                        <b>Industry</b>: {industry2} <br></br>
                        <br></br>
                        <b>Description</b>: 
                        <br></br>
                        {description2}
                    </Card> 
                    <Card title={
                        <span>
                            {"Annual Return "}
                            <Tooltip title="Annual return is the percentage change in the value of an investment over a one-year period, representing the gain or loss made during that time.">
                            <QuestionCircleOutlined />
                        </Tooltip>
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
                            <BarChart data={annualReturnDataSelected2} margin={{top: 20, right: 30, left: 20, bottom: 20}} barSize={50}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year">
                                    <Label value="Annual Return (%)" offset={0} position="bottom" />
                                </XAxis>
                                <YAxis />
                                <Bar dataKey="annualReturn" fill="#8884d8">
                                    <LabelList dataKey="annualReturn" position="top" formatter={formatLabel}/>
                                </Bar>
                                <ReferenceLine y={0} stroke="#000" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title={
                        <span>
                            {"Annualized Return "}
                            <Tooltip title="Annualized return is a measure of an investment's average annual growth rate over a period of time that may be longer or shorter than one year. It provides a way to compare the performance of investments with different timeframes by annualizing the returns, making them directly comparable on an annual basis.">
                                <QuestionCircleOutlined />
                            </Tooltip>
                        </span>
                    }>   
                        <Table dataSource={annualizedReturnData2} columns={annualizedReturnColumns} pagination={false} />
                    </Card>
                    <Card title={
                        <span>
                            {"Annualized Volatility "}
                            <Tooltip title="Annualized volatility is a measure of the variation in the returns of an investment over a year. It quantifies the degree of risk or price fluctuations associated with the investment on an annualized basis, helping one to assess its stability and potential for both gains and losses.">
                            <QuestionCircleOutlined />
                        </Tooltip>
                        </span>
                    }>   
                        <Card type="inner" title="Annualized Volatility (Yearly)">
                            Annualized Volatility by years uses monthly stock data. 
                            <br></br><br></br>
                            <Table dataSource={annualizedVolatilityData2} columns={annualizedVolatilityColumns} pagination={false}/>
                        </Card>
                        <Card type="inner" title="Annualized Volatility (Shorter time periods: Week, Months)">
                            Annualized Volatility for shorter time periods such as weeks and months uses daily stock data which may be more accurate than the monthly data.
                            <br></br><br></br>
                            <Table dataSource={annualizedVolatilityDaysData2} columns={annualizedVolatilityDaysColumns} pagination={false}/>
                        </Card>
                    </Card>
                </div>

            </div> */}
        </Content>


    );

};
export default StockComparison;