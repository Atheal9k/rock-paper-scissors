export const shortenAddress = (address: `0x${string}` | undefined) => {
  if (!address || typeof address !== "string" || address.length < 42) {
    throw new Error("Invalid Ethereum address");
  }

  const start = address.slice(0, 4);
  const end = address.slice(-4);
  return `${start}...${end}`;
};
