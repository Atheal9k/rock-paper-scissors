"use client";

import { createContext, useEffect, useState } from "react";
import { WagmiConfig, sepolia, createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";

interface WagmiProviderProps {
  children: React.ReactNode;
}

export const WagmiConfigContext = createContext({
  isConfigReady: false,
  setIsConfigReady: (_: boolean) => {},
});

const WagmiProvider: React.FC<WagmiProviderProps> = ({ children }) => {
  const projectId = process.env.WAGMI_PROJECT_ID || undefined;
  const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";

  const [wagmiConfig, setWagmiConfig] = useState<any>(null);
  const [isConfigReady, setIsConfigReady] = useState(false);
  useEffect(() => {
    if (alchemyKey) {
      const { chains, publicClient, webSocketPublicClient } = configureChains(
        [sepolia],
        [alchemyProvider({ apiKey: alchemyKey }), publicProvider()]
      );

      const config = createConfig({
        autoConnect: true,
        connectors: [new MetaMaskConnector({ chains })],
        publicClient,
        webSocketPublicClient,
      });

      setWagmiConfig(config);
      setIsConfigReady(true);
    }
  }, [projectId, alchemyKey]);

  return (
    <WagmiConfigContext.Provider value={{ isConfigReady, setIsConfigReady }}>
      {wagmiConfig ? (
        <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
      ) : (
        <div>Loading...</div>
      )}
    </WagmiConfigContext.Provider>
  );
};

export default WagmiProvider;
