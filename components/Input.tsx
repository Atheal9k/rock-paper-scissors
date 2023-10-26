"use client";
import React, { forwardRef } from "react";
import styled from "styled-components";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Wrapper = styled.input`
  border-width: 1px;
  border-color: #86ead4;
  border-radius: calc(4px * 0.95 * 1);
  padding-left: 0.75rem;
  padding-right: 0.75rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  margin: 10px 0px;

  &:focus {
    outline: 2px solid transparent;
    outline-offset: 2px;
    box-shadow: 0 0 0 2px black;
  }

  &:hover {
    box-shadow: 0 0 0 1px black;
  }

  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type="number"] {
    -moz-appearance: textfield;
  }
`;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, disabled, placeholder, ...props }, ref) => {
    return (
      <Wrapper
        type={type}
        className={className}
        disabled={disabled}
        ref={ref}
        placeholder={placeholder}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
