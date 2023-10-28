import useGameState from "@/hooks/useGameState";
import updateActiveContracts from "@/lib/updateActiveContracts";
import { Button } from "@radix-ui/themes";
import axios from "axios";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";

interface GameEndComponentProps {
  currentStakedEthAmount: number;
  formattedEthAmount: string;
  contractInstance: ethers.Contract | undefined;
  connectedAddress: `0x${string}` | undefined;
  resetState: () => void;
}

const WinDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const GameEndComponent: React.FC<GameEndComponentProps> = ({
  currentStakedEthAmount,
  formattedEthAmount,
  contractInstance,
  connectedAddress,
  resetState,
}) => {
  const [ethReward, setEthReward] = useState<number | string>(
    Number(formattedEthAmount)
  );

  const gameStateStore = useGameState();

  useEffect(() => {
    getIfWon();
  }, [currentStakedEthAmount]);

  const getIfWon = async () => {
    if (Number(currentStakedEthAmount) === 0) {
      const response = await axios.get(
        `/api/activeContractsByContractAddress?contractAddress=${gameStateStore.contractAddress}`
      );

      const move = response?.data[0]?.move;
      const salt = response?.data[0]?.salt;
      const j1Address = response?.data[0]?.player_address;
      const j2Address = response?.data[0]?.player_two_address;

      const res = await contractInstance?.c2();
      const playerTwoMove = ethers.formatUnits(res, 0);

      //event if game was ended normally
      if (contractInstance && move && salt) {
        const hasWon = await contractInstance.win(move, playerTwoMove);

        if (Number(playerTwoMove) === 0) {
          gameStateStore.setWinnerAddress(j1Address);
          gameStateStore.setGameTimedOut(true);
        } else if (Number(move) === Number(playerTwoMove)) {
          gameStateStore.setWinnerAddress("tie");
        } else if (hasWon) {
          gameStateStore.setWinnerAddress(j1Address);
        } else {
          gameStateStore.setWinnerAddress(j2Address);
        }

        const doubleEth =
          ethers.parseEther(formattedEthAmount) * ethers.toBigInt(2);

        setEthReward(ethers.formatEther(doubleEth));

        gameStateStore.setGameIsEnding(false);
        gameStateStore.setGameEnded(true);
        await updateActiveContracts(connectedAddress);
        toast.success("You have ended the game successfully!");
        return;
      }
    }
  };

  const winOrLose = () => {
    if (gameStateStore.timedOut) {
      return (
        <WinDiv>
          Game has timed out. {formattedEthAmount} ETH has been returned to you.
          <Button onClick={resetState}>Go Home</Button>
        </WinDiv>
      );
    }

    if (
      Number(currentStakedEthAmount) > 0 ||
      currentStakedEthAmount === undefined
    ) {
      return null;
    }

    const winner = gameStateStore.winnerAddress;

    if (winner === "tie") {
      return (
        <WinDiv>
          You Tied! Your ETH is sent back to you.
          <Button onClick={resetState}>Go Home</Button>
        </WinDiv>
      );
    }

    if (winner === connectedAddress?.toLowerCase()) {
      return (
        <WinDiv>
          You got Eth back!
          <Button onClick={resetState}>Go Home</Button>
        </WinDiv>
      );
    }

    if (winner !== connectedAddress?.toLowerCase()) {
      return (
        <WinDiv>
          You lost Eth.
          <Button onClick={resetState}>Go Home</Button>
        </WinDiv>
      );
    }
  };

  return <>{winOrLose()}</>;
};

export default GameEndComponent;
