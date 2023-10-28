import { ethers } from "ethers";
import { DateTime } from "luxon";

const calcTimeoutRemaining = async (
  contractInstance: ethers.Contract | undefined
) => {
  if (contractInstance) {
    try {
      const now = DateTime.utc();
      //@ts-ignore
      const timestampInMilliseconds = now.ts;
      const timestampInSeconds = Math.floor(timestampInMilliseconds / 1000);

      const _lastAction = await contractInstance.lastAction();
      const _timeoutConstant = await contractInstance.TIMEOUT();

      const lastAction = Number(ethers.formatUnits(_lastAction, 0));
      const timeoutConstant = Number(ethers.formatUnits(_timeoutConstant, 0));

      if (Number(timestampInSeconds) >= lastAction + timeoutConstant) {
        return 0;
      }

      //Return remaining time
      return Math.abs(
        Number(timestampInSeconds) - (lastAction + timeoutConstant)
      );
    } catch (error) {
      throw new Error(`Something went wrong ${error}`);
    }
  }
};

export default calcTimeoutRemaining;
