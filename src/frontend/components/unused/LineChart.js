import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const LineChart = () => {
  // Sample moving average prices, limited to half the original data
  const movingAveragePrices = [4.1, 4.2, 4, 4.4, 4.5];

  // Calculate execution levels at 5% below the moving average prices
  const executionLevels = movingAveragePrices.map((price) => price * 0.95);
  const latestAvgPrice = movingAveragePrices[movingAveragePrices.length - 1];
  const latestExecutionPrice = executionLevels[executionLevels.length - 1];

  const data = {
    labels: movingAveragePrices.map((_, index) => index + 1),
    datasets: [
      {
        label: `Current Avg Price: $${latestAvgPrice}`,
        data: movingAveragePrices,
        borderColor: 'white',
        borderWidth: 2,
        pointRadius: movingAveragePrices.map(
          (_, index) => (index === movingAveragePrices.length - 1 ? 5 : 0), // larger point at the last data
        ),
      },
      {
        label: `Execution Price: $${latestExecutionPrice}`,
        data: executionLevels,
        borderColor: 'red',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: executionLevels.map(
          (_, index) => (index === executionLevels.length - 1 ? 5 : 0), // larger point at the last data
        ),
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'white', // Set color of legend text
        },
      },
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
