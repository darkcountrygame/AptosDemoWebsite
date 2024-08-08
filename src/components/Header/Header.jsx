import React, { useEffect, useRef, useState } from "react";
import dcLogo from "../../resourses/dcLOGO.png";
import { useWallet, truncateAddress  } from '@aptos-labs/wallet-adapter-react';
import { WalletConnector } from "@aptos-labs/wallet-adapter-mui-design"

import "./Header.scss";
import CustomButton from "../Shared/CustomButton/CustomButton";

import { Link, useLocation } from "react-router-dom";
import { Network } from "aptos";
import useSignAndSubmitTransaction from "../../hooks/useSignAndSubmitTransaction";


export const Header = () => {
  const { account,  connected, disconnect } = useWallet();
  const [visibility, setVisibility] = useState(false);
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useSignAndSubmitTransaction()

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const disconnectHandler = () => {
    disconnect();
  };

  
  useEffect(() => {
    const handleHeaderVisibility = () => {
        const pagesWithoutHeader = ['/unpacker'];
        setVisibility(!!pagesWithoutHeader.includes(pathname));
    };

    handleHeaderVisibility();
}, [pathname]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false); 
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div className={`header-wrapper ${visibility ?  'visibility-hidden' : ''}`}>
      <div className="header-content">
        <div className="header-left-container">
          <div className="header-logo">
            <Link to="/market">
              <img src={dcLogo} alt="dc-logo" />
            </Link>
          </div>
          <div className="header-menu">
            <Link to="staking" className="menu-item">Staking</Link>
            <Link to="unpacker" className="menu-item">Unpacker</Link>
            <Link to="market" className="menu-item">Market</Link>
            <Link to="secondary-market" className="menu-item">Secondary Market</Link>
          </div>
        </div>
          <div ref={menuRef} >
            <div className="burger-menu" onClick={toggleMenu}>
              {isMenuOpen ? '✖' : '☰'}
            </div>
            <div  className={`login-menu ${isMenuOpen ? 'open' : ''}`}>
            {connected ? (
              <>
              <div className="login-menu-item">
                Address: <span className="acc-name">{account && truncateAddress(account?.address)}</span>
              </div>
              <CustomButton onClick={disconnectHandler} text="Disconnect" />
              </>
              ): (
                <WalletConnector
                    networkSupport={Network.MAINNET}
                />
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
