import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

interface RadixThemeProviderProps {
  children: React.ReactNode;
}

const RadixThemeProvider: React.FC<RadixThemeProviderProps> = ({
  children,
}) => {
  return (
    <Theme appearance="light" accentColor="mint" grayColor="gray" scaling="95%">
      {children}
    </Theme>
  );
};

export default RadixThemeProvider;
