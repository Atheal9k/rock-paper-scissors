"use client";
import Header from "@/components/Header";
import styled from "styled-components";
import { WagmiConfigContext } from "@/providers/WagmiProvider";
import { useCallback, useContext, useEffect, useState } from "react";
import Loading from "./loading";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { ethers } from "ethers";
import { RPS_ABI } from "@/constants/abi/abis";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import PlayerAEnd from "@/components/PlayerAMoves/PlayerAEnd";
import PlayerAStart from "@/components/PlayerAMoves/PlayerAStart";
import PlayerBMoves from "@/components/PlayerBMoves";
import { shortenAddress } from "@/lib/shortenAddress";

import axios from "axios";
import useGameState from "@/hooks/useGameState";

export const revalidate = 0;

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  align-items: center;
`;

const Card = styled.div`
  width: 475px;
  height: 700px;
  border: 1px solid #86ead4;
  box-shadow: 1px 0 6px 1px black;
  display: flex;
  flex-direction: column;
  padding: 2rem;
`;

const ConnectButton = styled.div`
  display: flex;
  justify-content: center;

  & > button {
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-right: 5px;
    margin-left: 5px;

    &:hover {
      background-color: #ef801a;
    }
  }
`;

const AccountInfo = styled.div`
  margin-right: 5px;
`;

export default function Home() {
  const { isConfigReady } = useContext(WagmiConfigContext);

  const [contractActive, setContractActive] = useState(false);
  const [stakedEthAmount, setStakedEthAmount] = useState("0");
  const [playerTwoAddress, setPlayerTwoAddress] = useState(null);
  const [rpsContract, setRpsContract] = useState<ethers.Contract | undefined>(
    undefined
  );
  const [connectedAddress, setConnectedAddress] = useState<`0x${string}`>();

  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { disconnect } = useDisconnect();
  const { data: userBalance } = useBalance({
    address: address,
  });
  const signer = useEthersSigner();

  const gameStateStore = useGameState();

  const getIsContractActive = useCallback(async () => {
    const response = await axios.get(
      `/api/activeContracts?playerAddress=${address?.toLowerCase()}`
    );

    if (response.data.length > 0) {
      setContractActive(true);
      const contractAddres = response.data[0].contract_address;
      gameStateStore.setContractAddress(contractAddres);
      const rpsInstance = new ethers.Contract(contractAddres, RPS_ABI, signer);
      setRpsContract(rpsInstance);
      const stake = await rpsInstance.stake();
      setStakedEthAmount(stake);

      setPlayerTwoAddress(response.data[0].player_two_address);
    }
  }, [address, signer]);

  const initAddress = useCallback(async () => {
    if (address) {
      setConnectedAddress(address);
    }
  }, [address]);

  useEffect(() => {
    getIsContractActive();
  }, [getIsContractActive]);

  useEffect(() => {
    initAddress();
  }, [initAddress]);

  if (!isConfigReady) {
    return <Loading />;
  }

  const resetState = () => {
    setContractActive(false);
    setStakedEthAmount("0");
    setPlayerTwoAddress(null);
    setRpsContract(undefined);
    gameStateStore.setGameTimedOut(false);
    gameStateStore.setGameIsEnding(false);
    gameStateStore.setGameEnded(false);
    gameStateStore.setWinnerAddress(undefined);
    gameStateStore.setContractAddress(undefined);
  };

  const getComponentToRender = () => {
    if (!isConnected) {
      return;
    }

    if (
      contractActive &&
      connectedAddress?.toLowerCase() !== playerTwoAddress
    ) {
      return (
        <PlayerAEnd
          stakedEthAmount={stakedEthAmount}
          connectedAddress={address}
          rpsContract={rpsContract}
          resetState={resetState}
        />
      );
    }

    if (
      contractActive &&
      connectedAddress?.toLowerCase() === playerTwoAddress
    ) {
      return (
        <PlayerBMoves
          stakedEthAmount={stakedEthAmount}
          connectedAddress={address}
          rpsContract={rpsContract}
          resetState={resetState}
          getIsContractActive={getIsContractActive}
        />
      );
    }

    if (!contractActive) {
      return (
        <PlayerAStart
          connectedAddress={address}
          getIsContractActive={getIsContractActive}
        />
      );
    }
  };

  return (
    <Container>
      <Card>
        <Header />
        <ConnectButton>
          {isConnected ? (
            <AccountInfo>
              <div>{shortenAddress(address)}</div>
              <div>{userBalance?.formatted?.slice(0, 6)} SEP</div>
            </AccountInfo>
          ) : null}
          {!isConnected &&
            connectors.map((connector) => (
              <button
                disabled={!connector.ready}
                key={connector.id}
                onClick={() => connect({ connector })}
              >
                {`Connect With ${connector.name}`}
                {!connector.ready && " (unsupported)"}
                {isLoading &&
                  connector.id === pendingConnector?.id &&
                  " (connecting)"}
              </button>
            ))}
          <button onClick={() => disconnect()}>Disconnect</button>
          {error && <div>{error.message}</div>}
        </ConnectButton>
        {getComponentToRender()}
      </Card>
    </Container>
  );
}
