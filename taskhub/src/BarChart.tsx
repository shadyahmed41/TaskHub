// BarChart.js
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const BarChart = ({ data }: any) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart<"bar">>();

  useEffect(() => {
    if (chartRef && chartRef.current) {
        if (chartInstance.current) {
          chartInstance.current.destroy(); // Destroy previous chart instance
        }
        const ctx = chartRef.current.getContext("2d");
        if (ctx) {
          chartInstance.current = new Chart(ctx, {
            type: "bar",
            data: {
              labels: Object.keys(data),
              datasets: [
                {
                  label: "Field Distribution",
                  data: Object.values(data),
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(255, 206, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(153, 102, 255, 0.7)",
                    "rgba(255, 159, 64, 0.7)",
                    "rgba(220, 53, 69, 0.7)",
                    "rgba(0, 123, 255, 0.7)",
                    "rgba(40, 167, 69, 0.7)",
                  ],
                  borderWidth: 1,
                },
              ],
            },
            options: {
              // Specify chart options (e.g., title, legend, etc.)
              responsive: true,
              maintainAspectRatio: false,
            },
          });
      }
    }
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default BarChart;
