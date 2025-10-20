"use client";
import React from "react";
import { useAccount, useReadContract } from "wagmi";
import { SAVFE_ABI, SAVFE_ADDRESS, CHILD_SAVFE_ABI, publicClient } from "../lib/contract";
import { formatEther } from "viem";
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
  const { address } = useAccount();
  const { data: childContractAddress } = useReadContract({
    address: SAVFE_ADDRESS,
    abi: SAVFE_ABI,
    functionName: 'getUserChildContractAddressByAddress',
    args: address ? [address] : [],
    query: {
      enabled: !!address,
    }
  });

  const { data: savingsNames } = useReadContract({
    address: childContractAddress as `0x${string}` | undefined,
    abi: CHILD_SAVFE_ABI,
    functionName: 'getSavingsNames',
    args: [],
    query: {
      enabled: !!childContractAddress,
    }
  });

  const [realData, setRealData] = React.useState<SavingsDataPoint[]>([]);

  React.useEffect(() => {
    const fetchRealData = async () => {
      if (!childContractAddress || !savingsNames || !(savingsNames as any).savingsNames) {
        setRealData([]);
        return;
      }

      const dataPoints: SavingsDataPoint[] = [];
      const savingsList = (savingsNames as any).savingsNames as string[];

      for (const savingName of savingsList) {
        try {
          const savingData = await publicClient.readContract({
            address: childContractAddress as `0x${string}`,
            abi: CHILD_SAVFE_ABI,
            functionName: 'getSaving',
            args: [savingName],
          });

          if (savingData && (savingData as any).isValid) {
            const amount = Number(formatEther((savingData as any).amount));
            const createdAt = (savingData as any).createdAt || Math.floor(Date.now() / 1000) - 86400 * 30;
            const date = new Date(createdAt * 1000).toISOString().split('T')[0];

            dataPoints.push({
              date,
              amount,
            });
          }
        } catch (error) {
          console.error(`Error fetching saving ${savingName}:`, error);
        }
      }

      // Sort by date and accumulate amounts
      dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let cumulativeAmount = 0;
      const cumulativeData = dataPoints.map(point => ({
        ...point,
        amount: cumulativeAmount += point.amount
      }));

      setRealData(cumulativeData);
    };

    fetchRealData();
  }, [childContractAddress, savingsNames]);

  const dataToUse = realData.length > 0 ? realData : savingsData;
  const labels = dataToUse.map((point) => point.date);
  const data = {
    labels,
    datasets: [
      {
        label: "Savings Over Time",
        data: dataToUse.map((point) => point.amount),
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
