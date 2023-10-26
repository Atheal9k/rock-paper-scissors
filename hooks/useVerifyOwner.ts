import { useEffect, useState } from "react";
import { recoverMessageAddress } from "viem";

const useVerifyOwner = async (signature: `0x${string}` | undefined) => {
  const MESSAGE = "Welcome To The Game Of Rock Paper Scissors Spock Lizard";

  const [address, setAddress] = useState<`0x${string}`>();

  useEffect(() => {
    const getAddress = async () => {
      if (signature) {
        const recoveredAddress = await recoverMessageAddress({
          message: MESSAGE,
          signature: signature,
        });
        setAddress(recoveredAddress);
      }
    };
    getAddress();
  }, [signature]);

  return address;
};

export default useVerifyOwner;
