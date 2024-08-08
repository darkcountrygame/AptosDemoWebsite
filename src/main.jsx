import React from "react";
import ReactDOM from "react-dom/client";

import { AptosWalletAdapterProvider, NetworkName } from "@aptos-labs/wallet-adapter-react";
import App from "./App";
import { BloctoWallet } from "@blocto/aptos-wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PetraWallet } from "petra-plugin-wallet-adapter";

const wallets  = [
  new PetraWallet(),
  new MartianWallet(),
]

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true} optInWallets={["Petra"]}>
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
