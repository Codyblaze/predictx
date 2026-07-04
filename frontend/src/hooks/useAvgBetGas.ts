"use client";

import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { estimateBetGasCost, formatGasCost } from "@/lib/gas";
import { NATIVE_TOKEN_SYMBOL } from "@/lib/contracts";

export function useAvgBetGas() {
  const publicClient = usePublicClient();

  const { data, isLoading } = useQuery({
    queryKey: ["avgBetGas"],
    queryFn: async () => {
      if (!publicClient) return null;
      const gasPrice = await publicClient.getGasPrice();
      const cost = estimateBetGasCost(gasPrice);
      return {
        cost,
        formatted: formatGasCost(cost, NATIVE_TOKEN_SYMBOL),
      };
    },
    enabled: !!publicClient,
    refetchInterval: 60_000,
  });

  return {
    cost: data?.cost,
    formatted: data?.formatted,
    isLoading,
  };
}
