import Home from "./components/Home";
import { config } from "./config";
// import { ChainProvider, ReactiveDotProvider } from "@reactive-dot/react";
import { Suspense } from "react";
// import { MyComponent } from "./my-component";
import { Providers } from "./providers/providers";
import { ThemeProvider } from "./components/theme-provider";

{
  /* <MyComponent /> */
}

export function App() {
  return (
    // <ReactiveDotProvider config={config}>
    // <ChainProvider chainId="polkadot">
    <Suspense>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Providers>
          <Home />
        </Providers>
      </ThemeProvider>
    </Suspense>
    // </ChainProvider>
    // </ReactiveDotProvider>
  );
}

export default App;
