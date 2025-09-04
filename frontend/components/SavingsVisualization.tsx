"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SavingsDataPoint {
  date: string;
  amount: number;
}

interface SavingsVisualizationProps {
  savingsData?: SavingsDataPoint[];
}

const defaultData: SavingsDataPoint[] = [
  { date: "2023-01-01", amount: 0 },
  { date: "2023-02-01", amount: 100 },
  { date: "2023-03-01", amount: 250 },
  { date: "2023-04-01", amount: 400 },
  { date: "2023-05-01", amount: 600 },
  { date: "2023-06-01", amount: 800 },
  { date: "2023-07-01", amount: 1000 },
];

export default function SavingsVisualization({ savingsData = defaultData }: SavingsVisualizationProps) {
  const labels = savingsData.map((point) => point.date);
  const data = {
    labels,
    datasets: [
      {
        label: "Savings Over Time",
        data: savingsData.map((point) => point.amount),
        fill: false,
        borderColor: "rgb(59, 130, 246)", // Tailwind blue-500
        backgroundColor: "rgb(59, 130, 246)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Savings Progress Over Time",
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Amount Saved (ETH)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <Card className="gradient-card-hover animate-fade-in">
      <CardHeader>
        <CardTitle>Savings Goals Visualization</CardTitle>
        <CardDescription>Track your savings progress over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Line data={data} options={options} />
      </CardContent>
    </Card>
  );
}
