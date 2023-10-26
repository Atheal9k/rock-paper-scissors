import { Button } from "@radix-ui/themes";
import React, { useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import Input from "../Input";
import { ethers } from "ethers";
import axios from "axios";
import { DateTime } from "luxon";
import useDeleteActiveContracts from "@/hooks/useDeleteActiveContracts";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  const [won, setWon] = useState<boolean | null>(null);

  const formattedEthAmount = ethers.formatUnits(stakedEthAmount);

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();

    //TODO: ADD Signature Auth so only owner can get salt
    const response = await axios.get(
      `/api/activeContracts?playerAddress=${connectedAddress}`
    );

    const move = response.data[0].move;
    const salt = response.data[0].salt;

    if (rpsContract) {
      try {
        setLoading(true);

        await rpsContract.solve(move, salt);
        const res = await rpsContract.c2();
        const playerTwoMove = ethers.formatUnits(res, 0);
        const hasWon = await rpsContract.win(move, playerTwoMove);
        setWon(hasWon);
        await useDeleteActiveContracts(connectedAddress);
        toast.success("You have ended the game successfully!");
        setLoading(false);
        //resetState();
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
        //Let player 1 take back funds
        const _lastAction = await rpsContract.lastAction();
        const _timeoutConstant = await rpsContract.TIMEOUT();

        const lastAction = Number(ethers.formatUnits(_lastAction, 0));
        const timeoutConstant = Number(ethers.formatUnits(_timeoutConstant, 0));
        if (Number(timestampInSeconds) >= lastAction + timeoutConstant) {
          await rpsContract.j2Timeout();
          await useDeleteActiveContracts(connectedAddress);
          toast.success("You withdrew your staked ETH");
          setLoading(false);
          setWon(true);
          return;
        }

        toast.error("Timeout has not been reached.");
        setLoading(false);
      } catch (err) {
        toast.error("Timeout cannot be called currently");
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
      <Input
        type="number"
        placeholder={`Current Staked Eth: ${formattedEthAmount}`}
        disabled={true}
      />

      <Button onClick={handleSolve} disabled={loading}>
        {loading ? "Please wait..." : "Solve"}
      </Button>
      <br />
      <Button onClick={handleTimeout} disabled={loading}>
        {loading ? "Please wait..." : "Timeout"}
      </Button>
    </Form>
  );
};

export default GenericMove;
