import "./LoginFirst.scss";
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design";
import { Network } from "aptos";

export const LoginFirst = ()  => {

  return (
    <div className={"login-first-wrapper"}>
           <WalletConnector
              networkSupport={Network.TESTNET}
          />
    </div>
  );
}
