import { VALID_MOVES } from "@/constants/validMoves";
import { Button } from "@radix-ui/themes";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import Input from "../Input";
import { ethers } from "ethers";
import {
  useContractActiveQuery,
  useHasj2PlayedQuery,
  useStakedEthQuery,
  useTimeoutQuery,
} from "@/hooks/useBlockchainQueries";
import GameEndComponent from "../GameEndComponent";
import calcTimeoutRemaining from "@/lib/calcTimeoutRemaining";
import useGameState from "@/hooks/useGameState";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const SelectWrapper = styled.div`
  display: flex;
  width: 100%;

  & > select {
    display: flex;
    margin: 10px 0px;
    width: 100%;
    border-radius: calc(4px * 0.95 * 1);
    border: 1px solid #86ead4;
    padding-left: 0.75rem 
    padding-right: 0.75rem 
    padding-top: 0.75rem 
    padding-bottom: 0.75rem 
    font-size: 0.875rem 
    line-height: 1.25rem 
  }
`;

const Option = styled.option`
  color: black;
  font-size: 16px;
  line-height: 2;
  border-radius: 3px;
  height: 30px;
  padding: 0 5px;
  outline: none;
`;

interface PlayerBMovesProps {
  stakedEthAmount: string;
  connectedAddress: `0x${string}` | undefined;
  rpsContract: ethers.Contract | undefined;
  resetState: () => void;
  getIsContractActive: () => void;
}

const PlayerBMoves: React.FC<PlayerBMovesProps> = ({
  stakedEthAmount,
  connectedAddress,
  rpsContract,
  resetState,
  getIsContractActive,
}) => {
  const [loading, setLoading] = useState(false);
  const [j2Moved, setj2Moved] = useState(false);

  const moveRef = useRef<HTMLSelectElement>(null);

  const formattedEthAmount = ethers.formatUnits(stakedEthAmount);

  const { data: blockChainIsActive } = useContractActiveQuery(connectedAddress);

  const { data: timeoutData } = useTimeoutQuery(rpsContract);

  const { data: currentStakedEthAmount } = useStakedEthQuery(rpsContract);

  const { data: hasJ2Played } = useHasj2PlayedQuery(rpsContract);

  const gameStateStore = useGameState();

  useEffect(() => {
    const checkIfJ2Moved = async () => {
      if (rpsContract) {
        const c2 = await rpsContract.c2();

        if (c2) {
          setj2Moved(true);
        }
      }
    };
    checkIfJ2Moved();
  }, [loading, rpsContract]);

  useEffect(() => {
    if (blockChainIsActive) {
      getIsContractActive();
    }
  }, [blockChainIsActive]);

  const handlePlay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rpsContract && moveRef.current) {
      const moveValue = Number(moveRef.current.value);
      if (moveValue <= 0) {
        toast.error("Please select a move to play");
        return;
      }

      if (Number(stakedEthAmount) <= 0) {
        toast.error("Staked Eth Amount is currently 0. Call Timeout");
        return;
      }
      try {
        setLoading(true);
        await rpsContract.play(moveValue, { value: stakedEthAmount });
        toast.success("Move successfully played!");
        setj2Moved(true);
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Transaction Reverted");
        setLoading(false);
      }
    }
  };

  const handleTimeout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rpsContract) {
      try {
        setLoading(true);

        //Let player 2 take back funds
        const timeRemaining = await calcTimeoutRemaining(rpsContract);

        if (timeRemaining === 0) {
          await rpsContract.j1Timeout();
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
        console.log(err);
        toast.error("Transaction Reverted");
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

      {gameStateStore.timedOut || gameStateStore.gameEnded === true ? null : (
        <>
          {hasJ2Played || j2Moved ? null : (
            <SelectWrapper>
              <select name="moves" id="moves" ref={moveRef}>
                {VALID_MOVES.map((move, index) => (
                  <Option value={index} key={move.name}>
                    {move.name}
                  </Option>
                ))}
              </select>
            </SelectWrapper>
          )}

          <Input
            type="number"
            placeholder={`Current Staked Eth: ${formattedEthAmount}`}
            disabled={true}
          />

          {hasJ2Played || j2Moved ? null : (
            <Button onClick={handlePlay} disabled={loading}>
              {loading ? "Please wait..." : "Play"}
            </Button>
          )}

          <br />
          <Button
            onClick={handleTimeout}
            disabled={(loading && timeoutData! > 0) || hasJ2Played === false}
          >
            {loading ? "Please wait..." : `Timeout`}
          </Button>
        </>
      )}
    </Form>
  );
};

export default PlayerBMoves;
