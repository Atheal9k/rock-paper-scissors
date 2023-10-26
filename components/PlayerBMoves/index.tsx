import { VALID_MOVES } from "@/constants/validMoves";
import { Button } from "@radix-ui/themes";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import Input from "../Input";
import { ethers } from "ethers";
import { DateTime } from "luxon";
import useDeleteActiveContracts from "@/hooks/useDeleteActiveContracts";

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

const WinDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 30px;
  margin-top: 5px;
  margin-bottom: 5px;
`;

interface GenericMoveProps {
  stakedEthAmount: string;
  connectedAddress: `0x${string}` | undefined;
  rpsContract: ethers.Contract | undefined;
  resetState: () => void;
}

const GenericMove: React.FC<GenericMoveProps> = ({
  stakedEthAmount,
  connectedAddress,
  rpsContract,
  resetState,
}) => {
  const [loading, setLoading] = useState(false);
  const [j2Moved, setj2Moved] = useState(false);
  const [won, setWon] = useState<boolean | null>(null);

  const moveRef = useRef<HTMLSelectElement>(null);

  const formattedEthAmount = ethers.formatUnits(stakedEthAmount);

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
  }, [loading]);

  const handlePlay = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rpsContract && moveRef.current) {
      const moveValue = Number(moveRef.current.value);
      if (moveValue <= 0) {
        toast.error("Please select a move to play");
        return;
      }
      try {
        setLoading(true);
        await rpsContract.play(moveValue, { value: stakedEthAmount });
        toast.success("Move successfully played!");
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

    const now = DateTime.utc();
    //@ts-ignore
    const timestampInMilliseconds = now.ts;
    const timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);

    if (rpsContract) {
      try {
        setLoading(true);
        //Let player 2 take back funds
        const _lastAction = await rpsContract.lastAction();
        const _timeoutConstant = await rpsContract.TIMEOUT();

        const lastAction = Number(ethers.formatUnits(_lastAction, 0));
        const timeoutConstant = Number(ethers.formatUnits(_timeoutConstant, 0));

        if (Number(timestampInSeconds) >= lastAction + timeoutConstant) {
          await rpsContract.j1Timeout();
          await useDeleteActiveContracts(connectedAddress);
          toast.success("You withdrew your staked ETH");
          setLoading(false);
          setWon(true);
          return;
        }

        toast.error("Timeout has not been reached.");
        setLoading(false);
      } catch (err) {
        console.log(err);
        toast.error("Transaction Reverted");
        setLoading(false);
      }
    }
  };

  const winOrLose = () => {
    if (won === null) {
      return null;
    }

    if (won) {
      return (
        <WinDiv>
          You Won {formattedEthAmount} ETH!
          <Button onClick={resetState}>Go Home</Button>
        </WinDiv>
      );
    }

    if (won === false) {
      return (
        <WinDiv>
          You Lost {formattedEthAmount} ETH
          <Button onClick={resetState}>Go Home</Button>
        </WinDiv>
      );
    }
  };

  return (
    <Form>
      {winOrLose()}
      {j2Moved ? null : (
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

      {j2Moved ? null : (
        <Button onClick={handlePlay} disabled={loading}>
          {loading ? "Please wait..." : "Play"}
        </Button>
      )}

      <br />
      <Button onClick={handleTimeout} disabled={loading}>
        {loading ? "Please wait..." : "Timeout"}
      </Button>
    </Form>
  );
};

export default GenericMove;
