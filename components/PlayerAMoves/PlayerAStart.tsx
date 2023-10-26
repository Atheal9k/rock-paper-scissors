"use client";
import deployContracts from "@/lib/deployContracts";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { VALID_MOVES } from "../../constants/validMoves";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "../Button";
import Input from "../Input";
import styled from "styled-components";

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

interface PlayerAStartProps {
  connectedAddress: `0x${string}` | undefined;
  getIsContractActive: () => void;
}

const PlayerAStart: React.FC<PlayerAStartProps> = ({
  connectedAddress,
  getIsContractActive,
}) => {
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(false);

  const moveRef = useRef<HTMLSelectElement>(null);
  const ethAmountRef = useRef<HTMLInputElement>(null);
  const playerAddressRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (moveRef.current && ethAmountRef.current && playerAddressRef.current) {
      const moveValue = Number(moveRef.current.value);
      const ethAmount = ethAmountRef.current.value;
      const playerTwoAddress = playerAddressRef.current.value.toLowerCase();

      if (Number(moveValue) <= 0) {
        toast.error("Please select a move to play");
        return;
      }

      if (Number(ethAmount) <= 0) {
        toast.error("Please stake more than 0 Eth");
        return;
      }

      if (
        playerTwoAddress.length !== 42 ||
        playerTwoAddress === connectedAddress?.toLowerCase()
      ) {
        toast.error("Please enter a valid address");
        return;
      }

      if (signer) {
        setLoading(true);
        await deployContracts(signer, ethAmount, playerTwoAddress, moveValue);
        getIsContractActive();
      }
      toast.success("Submitted!");
      setLoading(false);
    }
  };

  return (
    <Form>
      <SelectWrapper>
        <select name="moves" id="moves" ref={moveRef}>
          {VALID_MOVES.map((move, index) => (
            <Option value={index} key={move.name}>
              {move.name}
            </Option>
          ))}
        </select>
      </SelectWrapper>

      <Input
        type="number"
        placeholder={"Enter ETH Amount To Stake"}
        ref={ethAmountRef}
      />
      <Input
        type="text"
        placeholder={"Enter Player 2 Address"}
        ref={playerAddressRef}
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Please wait..." : "Submit"}
      </Button>
    </Form>
  );
};

export default PlayerAStart;
