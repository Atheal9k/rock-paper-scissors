import calcTimeoutRemaining from "@/lib/calcTimeoutRemaining";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ethers } from "ethers";

export const useContractActiveQuery = (
  playerAddress: `0x${string}` | undefined
) => {
  return useQuery({
    queryKey: ["blockDataRefresh", "useContractActiveQuery", playerAddress],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `api/activeContracts?playerAddress=${playerAddress}`
        );

        if (response?.data[0]) {
          return response.data[0];
        }

        return null;
      } catch (error) {
        throw new Error(`Something went wrong ${error}`);
      }
    },
    enabled: Boolean(playerAddress),
  });
};

export const useHasj2PlayedQuery = (
  contractInstance: ethers.Contract | undefined
) => {
  return useQuery({
    queryKey: ["blockDataRefresh", "useHasj2PlayedQuery", contractInstance],
    queryFn: async () => {
      if (contractInstance) {
        try {
          let response = await contractInstance.c2();
          response = ethers.formatUnits(response, 0);

          if (Number(response) > 0) {
            return true;
          }

          return false;
        } catch (error) {
          throw new Error(`Something went wrong ${error}`);
        }
      }
    },
    enabled: Boolean(contractInstance),
  });
};

export const useStakedEthQuery = (
  contractInstance: ethers.Contract | undefined
) => {
  return useQuery({
    queryKey: ["blockDataRefresh", "useStakedEthQuery", contractInstance],
    queryFn: async () => {
      if (contractInstance) {
        try {
          let response = await contractInstance.stake();
          response = ethers.formatUnits(response);

          return response;
        } catch (error) {
          throw new Error(`Something went wrong ${error}`);
        }
      }
    },
    enabled: Boolean(contractInstance),
  });
};

export const useTimeoutQuery = (
  contractInstance: ethers.Contract | undefined
) => {
  return useQuery({
    queryKey: ["blockDataRefresh", "useTimeoutQuery", contractInstance],
    queryFn: async () => {
      return await calcTimeoutRemaining(contractInstance);
    },
    enabled: Boolean(contractInstance),
  });
};
