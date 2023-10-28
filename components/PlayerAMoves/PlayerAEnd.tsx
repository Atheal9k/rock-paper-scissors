import { Button } from "@radix-ui/themes";
import React, { useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import Input from "../Input";
import { ethers } from "ethers";
import axios from "axios";
import updateActiveContracts from "@/lib/updateActiveContracts";
import {
  useHasj2PlayedQuery,
  useStakedEthQuery,
  useTimeoutQuery,
} from "@/hooks/useBlockchainQueries";
import GameEndComponent from "../GameEndComponent";
import calcTimeoutRemaining from "@/lib/calcTimeoutRemaining";
import useGameStateStore from "@/hooks/useGameState";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

interface PlayerAEndProps {
  stakedEthAmount: string;
  connectedAddress: `0x${string}` | undefined;
  rpsContract: ethers.Contract | undefined;
  resetState: () => void;
}

const PlayerAEnd: React.FC<PlayerAEndProps> = ({
  stakedEthAmount,
  connectedAddress,
  rpsContract,
  resetState,
}) => {
  const [loading, setLoading] = useState(false);

  const formattedEthAmount = ethers.formatUnits(stakedEthAmount);
  const { data: hasJ2Played } = useHasj2PlayedQuery(rpsContract);
  const { data: currentStakedEthAmount } = useStakedEthQuery(rpsContract);
  const { data: timeoutData } = useTimeoutQuery(rpsContract);

  const gameStateStore = useGameStateStore();

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        `/api/activeContracts?playerAddress=${connectedAddress}`
      );

      const move = response?.data[0]?.move;
      const salt = response?.data[0]?.salt;

      if (rpsContract && move && salt) {
        setLoading(true);

        await rpsContract.solve(move, salt);

        gameStateStore.setGameIsEnding(true);

        toast.success("You have ended the game successfully!");

        setLoading(false);
      }
    } catch (err) {
      console.log(err);
      toast.error("Transaction Reverted");
      setLoading(false);
    }
  };

  const handleTimeout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rpsContract) {
      try {
        setLoading(true);
        //Let player 1 take back funds
        const timeRemaining = await calcTimeoutRemaining(rpsContract);

        if (timeRemaining === 0) {
          await rpsContract.j2Timeout();
          await updateActiveContracts(connectedAddress);
          toast.success("You withdrew your staked ETH");
          setLoading(false);
          gameStateStore.setGameTimedOut(true);
          return;
        }

        toast.error(
          `Timeout has not been reached. Please wait another ${timeRemaining} seconds`
        );
        setLoading(false);
      } catch (err) {
        toast.error("Timeout cannot be called currently");
        setLoading(false);
      }
    }
  };

  return (
    <Form>
      <GameEndComponent
        currentStakedEthAmount={currentStakedEthAmount}
        formattedEthAmount={formattedEthAmount}
        contractInstance={rpsContract}
        connectedAddress={connectedAddress}
        resetState={resetState}
      />
      {!gameStateStore.gameEnded ? (
        <>
          {gameStateStore.timedOut ? null : gameStateStore.gameIsEnding ? (
            <div>Please wait for the blockchain...</div>
          ) : (
            <>
              <Input
                type="number"
                placeholder={`Current Staked Eth: ${formattedEthAmount}`}
                disabled={true}
              />

              <Button onClick={handleSolve} disabled={loading || !hasJ2Played}>
                {loading ? "Please wait..." : "Solve"}
              </Button>
              <br />
              <Button
                onClick={handleTimeout}
                disabled={loading && timeoutData! > 0}
              >
                {loading ? "Please wait..." : `Timeout`}
              </Button>
            </>
          )}
        </>
      ) : null}
    </Form>
  );
};

export default PlayerAEnd;
