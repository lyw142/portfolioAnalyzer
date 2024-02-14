import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Layout, Card, Table, Select, Space, Button, Tooltip as TooltipA } from 'antd';
// import stockAnalyticsDataJson from "../../../../mockData/stockAnalytics.json";
import { QuestionCircleOutlined } from '@ant-design/icons';
import { BarChart, Tooltip, CartesianGrid, XAxis, YAxis, Legend, Bar, ReferenceLine, LabelList, Label, ResponsiveContainer } from "recharts";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getStockByStockSymbol } from '../../../../routes';
import axios from 'axios';
import Loading from '../../../Loading/Loading';
import { LeftOutlined } from '@ant-design/icons';
import { notify } from '../../../../utils/notify';

const { Content } = Layout;

const formatLabel = (value) => {
    // format labels to 1dp
    return value.toFixed(1);
};


const StockAnalytics = () => {

    const navigate = useNavigate();

    const { state } = useLocation();
    const stockSymbol = state ? state.stockSymbol : null;

    const { stockSymbol: stockSymbolParams } = useParams(); // a backup for state

    const [isLoading, setIsLoading] = useState(true);
    const [annualReturnData, setAnnualReturnData] = useState(null);
    const [annualizedReturnData, setAnnualizedReturnData] = useState(null);
    const [annualizedVolatilityData, setAnnualizedVolatilityData] = useState(null);
    const [annualizedVolatilityDaysData, setAnnualizedVolatilityDaysData] = useState(null);
    const [annualReturnYearOptions, setAnnualReturnYearOptions] = useState(null);
    const [annualReturnYearDefault, setAnnualReturnYearDefault] = useState(null);
    const [annualReturnDataSelected, setAnnualReturnDataSelected] = useState(null);

    const [stockAnalyticsData, setStockAnalyticsData] = useState(null);

    const fetchStock = async (stockSymbol) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${getStockByStockSymbol}/${stockSymbol}`);
            if (response.status !== 200) return;
            const body = response.data;
            setStockAnalyticsData(body);
        } catch (err) {
            notify("error", "Failed to fetch stock analytics data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (stockSymbol == null) {
            fetchStock(stockSymbolParams);
        } else {
            fetchStock(stockSymbol);
        }
    }, [stockSymbol]);

    useEffect(() => {
        if (!stockAnalyticsData) return;
        processData(stockAnalyticsData);
    }, [stockAnalyticsData]);

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
                key: i,
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
                key: i,
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
            { key: '1', timePeriod: "1 week", volatility: null },
            { key: '2', timePeriod: "2 weeks", volatility: null },
            { key: '3', timePeriod: "1 month", volatility: null },
            { key: '4', timePeriod: "2 months", volatility: null },
            { key: '5', timePeriod: "3 months", volatility: null }
        ];

        for (let i = 0; i < annualizedVolatilityDaysArray.length; i++) {

            // let num  = annualizedVolatilityDaysArray[i][0].split(" ")[0];
            // let timePeriod = annualizedVolatilityDaysArray[i][0].split(" ")[1];
            // let timePeriod = annualizedVolatilityDaysArray[i][0]
            let timePer = annualizedVolatilityDaysArray[i][0];
            let volVal = annualizedVolatilityDaysArray[i][1].toFixed(2);

            let objIndex = annualizedVolatilityDaysData.findIndex((obj => obj.timePeriod == timePer));
            annualizedVolatilityDaysData[objIndex].volatility = volVal;

            // const annualizedVolatilityDaysObj = {
            //     timePeriod: annualizedVolatilityDaysArray[i][0],
            //     volatility: annualizedVolatilityDaysArray[i][1].toFixed(2)
            // };
            // annualizedVolatilityDaysData.push(annualizedVolatilityDaysObj);
        }
        // sort according to years
        // let sortedAnnualizedVolatilityDaysData = annualizedVolatilityData.sort((data1, data2) => (parseInt(data1.numYears) > parseInt(data2.numYears)) ? 1 : (parseInt(data1.numYears) < parseInt(data2.numYears)) ? -1 : 0);

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


    // const max = Math.max.apply(null, annualReturnDataSelected.map(entry => entry.uv));
    // const customizedDomain = [0, max + 50];

    if (!stockAnalyticsData || isLoading) return (
        <Loading height={'100vh'} />
    );

    const { stockName, country, sector, exchange, industry, stockDescription } = stockAnalyticsData;

    return (
        // <Content
        // style={{
        //     padding: 24,
        //     margin: '16px 24px',
        //     minHeight: 800,
        // }}
        // >

        //     <div style={{
        //         display: 'flex', 
        //         flexDirection: 'row', 
        //         width: '100%', 
        //         justifyContent:'centers', 
        //         gap:'20px',
        //         marginBottom: '20px', 
        //     }}>

        //         <div style={{
        //             width: '100%', 
        //         }}>
        //             <h1> {stockSymbol}</h1>
        //             <Card title="Annual Return">
        //                 Annual return is the percentage change in the value of an investment over a one-year period, representing the gain or loss made during that time.
        //                 <br></br><br></br>
        //                 <Space wrap> Number of years displayed: 
        //                     <Select
        //                     defaultValue={annualReturnYearDefault}
        //                     style={{
        //                         width: 120,
        //                     }}
        //                     onChange={handleChange}
        //                     options={annualReturnYearOptions}
        //                     />
        //                 </Space>
        //                 <ResponsiveContainer aspect={1.25}>
        //                     <BarChart data={annualReturnDataSelected} margin={{top: 20, right: 30, left: 20, bottom: 20}} barSize={60}>
        //                         <CartesianGrid strokeDasharray="3 3" />
        //                         <XAxis dataKey="year">
        //                             <Label value="Annual Return (%)" offset={0} position="bottom" />
        //                         </XAxis>
        //                         <YAxis />
        //                         <Tooltip />
        //                         {/* <Legend /> */}
        //                         <Bar dataKey="annualReturn" fill="#8884d8">
        //                             <LabelList dataKey="annualReturn" position="top" formatter={formatLabel}/>
        //                         </Bar>
        //                         <ReferenceLine y={0} stroke="#000" />
        //                     </BarChart>
        //                 </ResponsiveContainer>
        //             </Card>

        //             <Card title="Stock Information">
        //                 {/* <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false}/> */}
        //                 <b>Stock symbol</b>: {stockSymbol} <br></br>
        //                 <b>Stock name</b>: {stockName} <br></br>
        //                 <b>Country</b>: {country} <br></br>
        //                 <b>Sector</b>: {sector} <br></br>
        //                 <b>Exchange</b>: {exchange} <br></br>
        //                 <b>Industry</b>: {industry} <br></br>
        //                 <br></br>
        //                 <b>Description</b>: 
        //                 <br></br>
        //                 {stockDescription}
        //             </Card> 
        //             <Card title="Annualized Return">
        //                 Annualized return is a measure of an investment's average annual growth rate over a period of time that may be longer or shorter than one year. It provides a way to compare the performance of investments with different timeframes by annualizing the returns, making them directly comparable on an annual basis.
        //                 <br></br><br></br>
        //                 <Table dataSource={annualizedReturnData} columns={annualizedReturnColumns} pagination={false} />
        //             </Card>
        //             <Card title="Annualized Volatility">
        //                 Annualized volatility is a measure of the variation in the returns of an investment over a year. It quantifies the degree of risk or price fluctuations associated with the investment on an annualized basis, helping one to assess its stability and potential for both gains and losses.
        //                 <br></br><br></br>
        //                 <Card type="inner" title="Annualized Volatility (Yearly)">
        //                     Annualized Volatility by years uses monthly stock data. 
        //                     <br></br><br></br>
        //                     <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false}/>
        //                 </Card>
        //                 <Card type="inner" title="Annualized Volatility (Shorter time periods: Week, Months)">
        //                     Annualized Volatility for shorter time periods such as weeks and months uses daily stock data which may be more accurate than the monthly data.
        //                     <br></br><br></br>
        //                     <Table dataSource={annualizedVolatilityDaysData} columns={annualizedVolatilityDaysColumns} pagination={false}/>
        //                 </Card>
        //             </Card>
        //         </div>
        //     </div>
        // </Content>

        // ORIGINAL /////////////////////////////////////////////////////////////////////////////////
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >
            <Button
                onClick={() => navigate(-1)}
                icon={<LeftOutlined />}
            >
                Back
            </Button>
            <h1>{stockSymbol}</h1>
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
                            <BarChart data={annualReturnDataSelected} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year">
                                    <Label value="Annual Return (%)" offset={0} position="bottom" />
                                </XAxis>
                                <YAxis type="number" domain={['dataMin - 50', 'auto']} />
                                <Tooltip />
                                {/* <Legend /> */}
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
                    <Card title="Stock Information">
                        {/* <Table dataSource={annualizedVolatilityData} columns={annualizedVolatilityColumns} pagination={false}/> */}
                        <b>Stock symbol</b>: {stockSymbol} <br></br>
                        <b>Stock name</b>: {stockName} <br></br>
                        <b>Country</b>: {country} <br></br>
                        <b>Sector</b>: {sector} <br></br>
                        <b>Exchange</b>: {exchange} <br></br>
                        <b>Industry</b>: {industry} <br></br>
                        <br></br>
                        <b>Description</b>:
                        <br></br>
                        {stockDescription}
                    </Card>
                </div>
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'centers', gap: '20px'
            }}>
                <div style={{
                    width: '50%'
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
                    width: '50%'
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
            </div>
            <br></br>
        </Content>

    );

};
export default StockAnalytics;