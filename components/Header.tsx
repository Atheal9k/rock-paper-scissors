"use client";
import styled from "styled-components";

const Container = styled.div`
  border-bottom-width: 1px;
  padding: 1.25rem;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Text = styled.h1`
  font-size: 1.25rem
  line-height: 1.75rem 
  font-weight: 600;
`;

const Header = () => {
  return (
    <Container>
      <Text>Rock, Paper, Scissors, Lizzard, Spock</Text>
    </Container>
  );
};

export default Header;
