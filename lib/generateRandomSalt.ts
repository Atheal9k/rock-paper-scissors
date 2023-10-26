export const generateRandomSalt = () => {
  const min = 100000000;
  const max = 10000000000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
