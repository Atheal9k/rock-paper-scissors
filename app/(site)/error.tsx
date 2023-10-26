"use client";
import styled from "styled-components";

const Box = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Error = () => {
  return (
    <Box>
      <div>Something went wrong.</div>
    </Box>
  );
};

export default Error;
