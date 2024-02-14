import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { candleStickOptions } from './constants';

const CandlestickChart = ({ seriesData }) => {

    return (
        <div style={{
            width: '100%'
        }}>
            <ReactApexChart
                series={
                    [
                        {
                            data: seriesData
                        }
                    ]
                }
                options={candleStickOptions}
                type='candlestick'
            />
        </div>

    );
};
export default CandlestickChart;