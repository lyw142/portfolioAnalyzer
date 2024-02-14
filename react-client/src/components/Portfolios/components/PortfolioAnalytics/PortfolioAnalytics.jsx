import React, { useState, useEffect } from 'react';
import { Layout, Card, Table, Select, Space, Tooltip as TooltipA, Button, Segmented } from 'antd';
import { LeftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { BarChart, CartesianGrid, XAxis, YAxis, Bar, ReferenceLine, LabelList, Label, ResponsiveContainer, Tooltip } from "recharts";

import { notify } from '../../../../utils/notify';
import { getPortfolioRoute, historicalPriceRoute } from '../../../../routes';
import axios from 'axios';
import Loading from '../../../Loading/Loading';
import StockCard from '../../../Portfolios/components/StockCard/StockCard';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import DonutChart from '../../../Portfolios/components/PortfolioDetails/components/DonutChart/DonutChart';
import LineChart from '../PortfolioDetails/components/LineChart/LineChart';

const { Content } = Layout;

const formatLabel = (value) => {
    // format labels to 1dp
    return value.toFixed(1);
};


const PortfolioAnalytics = () => {

    const navigate = useNavigate();

    const { state } = useLocation();
    const portfolioId = state ? state.portfolioId : null;

    const { portfolioId: portfolioIdParams } = useParams(); // a backup for state

    const [annualReturnData, setAnnualReturnData] = useState(null);
    const [annualizedReturnData, setAnnualizedReturnData] = useState(null);
    const [annualizedVolatilityData, setAnnualizedVolatilityData] = useState(null);
    const [annualizedVolatilityDaysData, setAnnualizedVolatilityDaysData] = useState(null);
    const [annualReturnYearOptions, setAnnualReturnYearOptions] = useState(null);
    const [annualReturnYearDefault, setAnnualReturnYearDefault] = useState(null);
    const [annualReturnDataSelected, setAnnualReturnDataSelected] = useState(null);
    const [amountPlaced, setAmountPlaced] = useState(null);
    const [availableAmount, setAvailableAmount] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    const [portfolioData, setPortfolioData] = useState(null);
    const [historicalPriceMonthly, setHistoricalPriceMonthly] = useState(null);
    const [historicalPriceDaily, setHistoricalPriceDaily] = useState(null); const [historicalRange, setHistoricalRange] = useState('Monthly');


    useEffect(() => {
        if (!portfolioData) return;
        const placed = portfolioData.stockList?.reduce((acc, stock) => {
            return acc + stock.qty * stock.currentStockPrice;
        }, 0);
        const available = portfolioData.capitalAmount - placed;

        setAmountPlaced(placed.toFixed(2));
        setAvailableAmount(available.toFixed(2));

    }, [portfolioData]);


    useEffect(() => {
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

        if (portfolioId == null) {
            fetchPortfolio(portfolioIdParams);
            fetchHistoricalPriceMonthly(portfolioIdParams);
            fetchHistoricalPriceDaily(portfolioIdParams);
        } else {
            fetchPortfolio(portfolioId);
            fetchHistoricalPriceMonthly(portfolioId);
            fetchHistoricalPriceDaily(portfolioId);
        }
    }, [portfolioId]);

    useEffect(() => {
        if (!portfolioData) return;
        processData(portfolioData);
    }, [portfolioData]);



    const processData = (portfolioData) => {
        // annualReturns data 
        const annualReturnArray = Object.entries(portfolioData.annualReturn);
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
        const annualizedReturnArray = Object.entries(portfolioData.annualizedReturn);
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
        const annualizedVolatilityArray = Object.entries(portfolioData.annualizedVolatilityMonths);
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

        const annualizedVolatilityDaysArray = Object.entries(portfolioData.annualizedVolatilityDays);
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

    if (!portfolioData || isLoading || !historicalPriceDaily || !historicalPriceMonthly) return (
        <Loading height={'100vh'} />
    );

    return (
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
            <h2>{portfolioData.portfolioName}</h2>

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
                    <Card title="Portfolio Information">
                        <b>Capital Amount</b>: ${portfolioData.capitalAmount} <br></br>
                        <b>Strategy</b>: {portfolioData.portfolioStrategy} <br></br>
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
                            allocation={portfolioData && portfolioData.sectorAllocated}
                        />
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
                    width: '100%',
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
                                <Tooltip />
                                <Bar dataKey="annualReturn" fill="#8884d8">
                                    <LabelList dataKey="annualReturn" position="top" formatter={formatLabel} />
                                </Bar>
                                <ReferenceLine y={0} stroke="#000" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

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

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'centers',
                gap: '20px',
                marginBottom: '20px',
            }}>
                <div style={{
                    width: '100%',
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
                                portfolioData && portfolioData.combinedStockList.map((stock, index) => {
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
            </div>
        </Content>

    );

};
export default PortfolioAnalytics;