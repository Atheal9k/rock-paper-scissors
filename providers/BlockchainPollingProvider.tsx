"use client";
import { useEffect } from "react";
import { useWebSocketPublicClient, sepolia } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

const useBlockchainPolling = () => {
  const webSocketPublicClient = useWebSocketPublicClient({
    chainId: sepolia.id,
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const unwatch = webSocketPublicClient?.watchBlocks({
      onBlock: () => {
        queryClient.invalidateQueries({
          queryKey: ["blockDataRefresh"],
        });
      },
    });

    return () => unwatch?.();
  }, [webSocketPublicClient, queryClient]);
};

const BlockchainPollingProvider = () => {
  useBlockchainPolling();
  return null;
};

export default BlockchainPollingProvider;
