import { JsonRpcSigner, ethers } from "ethers";
import { RPS_ABI, HASHER_ABI } from "../constants/abi/abis";
import { RPS_BYTECODE } from "../constants/abi/bytecodes";
import axios from "axios";

const useDeployContracts = async (
  signer: JsonRpcSigner,
  stakedEthAmount: string,
  playerTwoAddress: string,
  playerOneMove: number
) => {
  const _j2 = playerTwoAddress;
  const move = playerOneMove;

  try {
    const salt = await axios.get("/api/salt");
    const randomSalt = salt.data.salt;

    const hasherAddress = "0xE6436158104f41a55a7f0F04E4EE9D9a0A3e3924";
    const hasherInstance = new ethers.Contract(
      hasherAddress,
      HASHER_ABI,
      signer
    );
    const _c1Hash = hasherInstance.hash(move, randomSalt);

    //DEPLOY RPS CONTRACT
    const RPSFactory = new ethers.ContractFactory(
      RPS_ABI,
      RPS_BYTECODE,
      signer
    );

    const rpsContract = await RPSFactory.deploy(_c1Hash, _j2, {
      value: ethers.parseEther(stakedEthAmount),
    });

    await rpsContract.waitForDeployment();
    const rpsAddress = await rpsContract.getAddress();

    await axios.post("/api/activeContracts", {
      contractAddress: rpsAddress.trim().toLowerCase(),
      playerOneAddress: signer.address.trim().toLowerCase(),
      playerTwoAddress: playerTwoAddress.trim().toLowerCase(),
      move: Number(move),
      salt: randomSalt,
    });
  } catch (error) {
    console.error("Contract deployment failed:", error);
  }
};

export default useDeployContracts;
