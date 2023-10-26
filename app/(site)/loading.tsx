"use client";

import styled from "styled-components";
import { BounceLoader } from "react-spinners";

const Box = styled.div`
  border-radius: 0.5rem;
  height: fit-content;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Loading = () => {
  return (
    <Box>
      <BounceLoader color="#86EAD4" size={40} />
    </Box>
  );
};

export default Loading;
