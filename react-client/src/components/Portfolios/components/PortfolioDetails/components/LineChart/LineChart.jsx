import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineController, LineElement, Title, LinearScale, PointElement, Legend, TimeScale, Tooltip } from "chart.js";
import moment from 'moment';
import 'chartjs-adapter-moment';

ChartJS.register(LineController, LineElement, Tooltip, Legend, PointElement, LinearScale, Title, TimeScale);

const LineChart = ({ dataset, type }) => {
    if (!dataset) return null;

    const data = {
        labels: Object.keys(dataset),
        datasets: [
            {
                label: `${type} returns`,
                data: Object.values(dataset),
                borderColor: '#2346c0',
                borderWidth: 2,
                fill: null,
                elements: {
                    point: {
                        radius: 0.75, // Set the point marker radius to 0 to remove them
                    },
                },
            },
        ],
    };

    // Chart options
    const options = {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                }
            },
            y: {
                type: 'linear',
                ticks: {
                    callback: function (value) {
                        return value.toFixed(2) + '%';
                    },
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    title: function (context) {
                        return moment(context[0].label).format('DD MMMM YYYY');
                    },
                    label: function (context) {
                        return context.dataset.label + ': ' + context.parsed.y.toFixed(2) + '%';
                    },
                },
            },
        },
    };
    return (
        <div>
            <Line data={data} options={options} />
        </div>
    );
};

export default LineChart;