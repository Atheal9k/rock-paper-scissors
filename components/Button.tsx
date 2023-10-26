"use client";
import React, { forwardRef } from "react";
import styled, { css } from "styled-components";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const Wrapper = styled.button`
  width: 100%;
  border-width: 1px;
  border-color: transparent;
  border-radius: calc(4px * 0.95 * 1);
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-weight: 500;
  background-color: #86ead4;
  margin: 10px 0px;
  color: black;
  cursor: pointer;

  &:hover {
    opacity: 0.75;
  }
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter,
    backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;

  // Disabled styles
  ${({ disabled }) =>
    disabled &&
    css`
      background-color: #e0e0e0;
      color: #a0a0a0;
      cursor: not-allowed;
      &:hover {
        transition: none;
        opacity: 1;
      }
    `}
`;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, disabled, type = "button", ...props }, ref) => {
    return (
      <Wrapper
        type={type}
        className={className}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </Wrapper>
    );
  }
);

Button.displayName = "Button";

export default Button;
