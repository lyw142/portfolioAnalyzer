import React from 'react';
import { Doughnut } from 'react-chartjs-2';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function generateBlueShades(numShades) {
    const shades = [];
    const baseColor = [54, 162, 235];

    for (let i = 0; i < numShades; i++) {
        const alpha = (i + 1) / (numShades + 1);
        const shade = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${alpha})`;
        shades.push(shade);
    }
    return shades;
}

function generateCategoricalColors(numCategories) {
    const categoricalColors = [
        'rgb(54, 162, 235)', // Blue
        'rgb(255, 99, 132)', // Red
        'rgb(255, 205, 86)', // Yellow
        'rgb(75, 192, 192)', // Green
        'rgb(153, 102, 255)', // Purple
        'rgb(255, 159, 64)', // Orange
    ];

    const colors = [];

    for (let i = 0; i < numCategories; i++) {
        colors.push(categoricalColors[i % categoricalColors.length]);
    }
    return colors;
}

const DonutChart = ({ type, allocation, legendPosition }) => {
    if (!type || !allocation) return null;

    const data = {
        labels: Object.keys(allocation),
        datasets: [
            {
                data: Object.values(allocation),
                backgroundColor: type === 'industry' ? generateBlueShades(Object.values(allocation).length) : generateCategoricalColors(Object.values(allocation).length),
            },
        ],
    };

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        cutoutPercentage: 70,
        plugins: {
            legend: {
                display: true,
                position: legendPosition ? legendPosition : type === 'industry' ? 'left' : 'bottom',
                align: 'center',
            },
        },
        tooltips: {
            callbacks: {
                label: (tooltipItem, data) => {
                    const dataset = data.datasets[tooltipItem.datasetIndex];
                    const total = dataset.data.reduce((previousValue, currentValue) => previousValue + currentValue);
                    const currentValue = dataset.data[tooltipItem.index];
                    const percentage = Math.floor((currentValue / total) * 100 + 0.5);
                    return `${dataset.labels[tooltipItem.index]}: ${percentage}%`;
                },
            },
        },
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Doughnut data={data} options={options} />
        </div>
    );
};

export default DonutChart;