import React from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ChartWidget({ title, dataPoints, labels, label, yMin, yMax, unit }) {
  const { isDark } = useTheme();

  const chartData = {
    labels: labels || Array(dataPoints.length).fill('').map((_, i) => `T-${dataPoints.length - i - 1}s`),
    datasets: [
      {
        label: label || title,
        data: dataPoints,
        borderColor: '#FFCD11', // CAT Yellow
        backgroundColor: 'rgba(255, 205, 17, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#FFCD11',
        pointBorderColor: isDark ? '#1a1a1a' : '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#FFCD11',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true,
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#111111' : '#ffffff',
        titleColor: isDark ? '#ffffff' : '#111111',
        bodyColor: isDark ? '#f3f4f6' : '#374151',
        borderColor: '#FFCD11',
        borderWidth: 1,
        titleFont: { family: 'Inter', size: 11, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        callbacks: {
          label: (context) => ` ${context.parsed.y} ${unit || ''}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawTicks: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Courier New', size: 9 }
        }
      },
      y: {
        min: yMin,
        max: yMax,
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          drawTicks: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          font: { family: 'Courier New', size: 9 }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-cat-charcoal border border-gray-200 dark:border-gray-800 rounded-lg p-4 shadow-sm w-full h-[220px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-mono font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase">{title}</h3>
        {unit && <span className="text-[10px] font-mono text-cat-yellow font-bold uppercase">{unit}</span>}
      </div>
      <div className="relative w-full h-[160px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
