import React, { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Table, Input, Space, Divider } from 'antd';
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import { notify } from '../../utils/notify';
import axios from 'axios';
import Loading from '../Loading/Loading';

const { Content } = Layout;

const formatDateTime = dateString => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false };
    return new Date(dateString).toLocaleString(undefined, options);
};

const Logs = () => {
    const navigate = useNavigate();

    const [logsData, setLogsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');

    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters({ confirm: true });
        setSearchText('');
    };

    useEffect(() => {
        if (!Cookies.get('email')) {
            // TODO: modify to check if its admin, if not -> kick out
            console.log('Unauthenticated User, please login');
            navigate('/login');
        } else {
            console.log('Authenticated User');
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);

            const response = await axios.get('http://localhost:8080/logs');

            if (response.status !== 200) {
                notify('error', 'Failed to fetch logs');
                return;
            }

            const body = response.data;
            setLogsData(body);
        } catch (err) {
            notify('error', 'Failed to fetch logs');
        } finally {
            setIsLoading(false);
        }
    };

    const getColumnSearchProps = (dataIndex, title) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${title}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#6100FF' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : false,
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const columns = [
        {
            title: 'Log ID',
            dataIndex: 'id',
            key: 'id',
            ...getColumnSearchProps('id', 'Log ID'),
        },
        {
            title: 'User ID',
            dataIndex: 'userID',
            key: 'userID',
            ...getColumnSearchProps('userID', 'User ID'),
        },
        {
            title: 'Portfolio ID',
            dataIndex: 'portfolioID',
            key: 'portfolioID',
            ...getColumnSearchProps('portfolioID', 'Portfolio ID'),
        },
        {
            title: 'Added Stock',
            dataIndex: 'addedStock',
            key: 'addedStock',
            render: addedStocks => (
                <>
                    {addedStocks &&
                        addedStocks.map((stock, index) => (
                            <div key={stock.stockSymbol}>
                                Symbol: <b>{stock.stockSymbol}</b>
                                <br />
                                Qty: {stock.qty}
                                <br />
                                Purchased Date Time: {formatDateTime(stock.purchasedDateTime)}
                                <br />
                                Current Stock Price: ${stock.currentStockPrice}
                                {addedStocks.length > 1 && index !== addedStocks.length - 1 && <Divider />}
                            </div>
                        ))}
                </>
            ),
        },
        {
            title: 'Removed Stock',
            dataIndex: 'removedStock',
            key: 'removedStock',
            render: removedStocks => (
                <>
                    {removedStocks &&
                        removedStocks.map((stock, index) => (
                            <div key={stock.stockSymbol}>
                                Symbol: <b>{stock.stockSymbol}</b>
                                <br />
                                Qty: {stock.qty}
                                <br />
                                Purchased Date Time: {formatDateTime(stock.purchasedDateTime)}
                                <br />
                                Current Stock Price: ${stock.currentStockPrice}
                                {removedStocks.length > 1 && index !== removedStocks.length - 1 && <Divider />}
                            </div>
                        ))}
                </>
            ),
        },
        {
            title: 'Capital Amount',
            dataIndex: 'capitalAmount',
            key: 'capitalAmount',
            render: amount => `$${amount}`
        },
        {
            title: 'Date Time',
            dataIndex: 'logDateTime',
            key: 'logDateTime',
            render: logDateTime => formatDateTime(logDateTime),
        },
    ];

    if (isLoading) return <Loading height={'95vh'} />;

    return (
        <Content
            style={{
                padding: 24,
                margin: '16px 24px',
                minHeight: 800,
            }}
        >
            <div className='header__container'
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '12px auto',
                }}>
                <div style={{
                    fontSize: '22px',
                    fontWeight: '600',
                }}>All Logs</div>
            </div>

            <Table dataSource={logsData.reverse()} columns={columns} />;

        </Content>
    );
};
export default Logs;;;;