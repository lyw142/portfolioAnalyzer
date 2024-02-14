import dayjs from "dayjs";

export const candleStickOptions = {
    chart: {
        height: 'auto',
        type: 'candlestick',
    },
    // title: {
    //     text: 'Weekly Adjusted Prices and Volumes ',
    //     align: 'left'
    // },
    annotations: {
        xaxis: [
            {
                borderColor: '#00E396',
                label: {
                    borderColor: '#00E396',
                    style: {
                        fontSize: '12px',
                        color: '#fff',
                        background: '#00E396'
                    },
                    orientation: 'horizontal',
                    offsetY: 7,
                }
            }
        ]
    },
    tooltip: {
        enabled: true,
    },
    xaxis: {
        type: 'category',
        labels: {
            formatter: function (val) {
                return dayjs(val).format('DD MMM YYYY');
            }
        }
    },
    yaxis: {
        tooltip: {
            enabled: true
        }
    }
};
