import React from "react";
import ReactDOM from "react-dom/client";

import { AptosWalletAdapterProvider, NetworkName } from "@aptos-labs/wallet-adapter-react";
import App from "./App";
import { BloctoWallet } from "@blocto/aptos-wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PetraWallet } from "petra-plugin-wallet-adapter";

const wallets  = [
  new PetraWallet(),
  new BloctoWallet({
    network: NetworkName.Testnet,
    bloctoAppId: "6d85f56e-5f2e-46cd-b5f2-5cf9695b4d46",
  }),
  new MartianWallet(),
]

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <App />
    </AptosWalletAdapterProvider>
  </React.StrictMode>
);
