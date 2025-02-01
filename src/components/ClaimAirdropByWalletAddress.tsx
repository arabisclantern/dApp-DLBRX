"use client";

import React, { useState } from "react";
import MyContractABI from "../utils/MyContract.json";
import USDTABI from "../utils/USDT.json";
import { ethers } from "ethers";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

const contractAddress = "0x464fD44452BDBB188ec4d0a0b12D05ccd629e76d";

const usdtAddresses: { [key: string]: string } = {
  Ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  BinanceSmartChain: "0x55d398326f99059fF775485246999027B3197955",
  Polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  Avalanche: "0xc7198437980c041c805a1edcba50c1ce5db95118",
  // Add more networks and their USDT addresses as needed
};

const getProviderByNetwork = (network: string): ethers.providers.JsonRpcProvider => {
  switch (network) {
    case "Ethereum":
      return new ethers.providers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
    case "BinanceSmartChain":
      return new ethers.providers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
    case "Polygon":
      return new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");
    case "Avalanche":
      return new ethers.providers.JsonRpcProvider("https://api.avax.network/ext/bc/C/rpc");
    default:
      throw new Error("Unsupported network");
  }
};

interface ClaimAirdropByWalletAddressProps {
  contract: ethers.Contract | null;
  signer: ethers.Signer | null;
}

const ClaimAirdropByWalletAddress: React.FC<ClaimAirdropByWalletAddressProps> = ({ contract, signer }) => {
  const [network, setNetwork] = useState<string>("BinanceSmartChain"); // Default to BSC
  const [userAddress, setUserAddress] = useState<string>("");
  const [airdropAmount, setAirdropAmount] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const claimAirdrop = async () => {
    if (!ethers.utils.isAddress(userAddress)) {
      setMessage("Invalid wallet address.");
      return;
    }

    setLoading(true);
    setMessage("Attempting to claim airdrop...");

    try {
      const provider = getProviderByNetwork(network);
      const usdtAddress = usdtAddresses[network];
      const usdtContract = new ethers.Contract(usdtAddress, USDTABI, provider);

      if (!contract || !signer) {
        setMessage("Contract or signer is missing.");
        setLoading(false);
        return;
      }

      const requiredUSDTAmount = parseUnits("0.7", 18);
      const userUSDTBalance = await usdtContract.balanceOf(userAddress);

      if (BigNumber.from(userUSDTBalance).lt(requiredUSDTAmount)) {
        setMessage("Insufficient USDT balance, you should have at least 0.7 USDT to claim 7000 DLBRX.");
        setLoading(false);
        return;
      }

      const userUSDTAllowance = await usdtContract.allowance(userAddress, contractAddress);

      if (BigNumber.from(userUSDTAllowance).lt(requiredUSDTAmount)) {
        setMessage("Please approve 0.7 USDT before claiming 7000 DLBRX.");
        setLoading(false);
        return;
      }

      const airdropTx = await contract.claimAirdrop();
      await airdropTx.wait();

      const airdropAmount = await contract.balanceOf(userAddress);
      setAirdropAmount(formatUnits(airdropAmount, 18));
      setMessage(`Airdrop successful! You received ${formatUnits(airdropAmount, 18)} DLBRX.`);
    } catch (err: any) {
      setMessage(`Error claiming airdrop: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

    return (
      <div
        style={{
          maxWidth: '480px',
          margin: '40px auto',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        {/* Heading */}
        <h1 style={{ fontSize: '1.8rem', fontWeight: '600', color: '#2c3e50', marginBottom: '20px' }}>
          Claim Your Airdrop
        </h1>
  
        {/* Network Select Dropdown */}
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
          style={{
            marginBottom: '20px',
            fontSize: '1rem',
            padding: '14px',
            borderRadius: '12px',
            width: '100%',
            border: '2px solidrgb(88, 83, 157)',
            boxShadow: '0 2px 4px rgba(169, 66, 147, 0.73)',
            backgroundColor: '#f8f9fa',
            color: '#34495e', // Darker, more readable text
            fontWeight: '500',
          }}
        >
          {Object.keys(usdtAddresses).map((net) => (
            <option key={net} value={net}>{net}</option>
          ))}
        </select>
  
        {/* Wallet Address Input */}
        <input
          type="text"
          placeholder="Enter the wallet address after connecting to the contract."
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          className="address-input"
          style={{
            fontSize: '1rem',
            padding: '14px',
            width: '90%',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 8px rgba(72, 31, 125, 0.08)',
            border: '2px solidrgb(22, 9, 53)',
            backgroundColor: '#f8f9fa',
            color: '#34495e', // Darker, more readable text
            fontWeight: '500',
          }}
        />
  
        {/* Claim Airdrop Button */}
        <button
          onClick={claimAirdrop}
          disabled={loading}
          className="airdrop-btn"
          style={{
            fontSize: '1.2rem',
            padding: '14px 28px',
            backgroundColor: '#007bff',
            color: '#ffffff', // White text for contrast
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            width: '100%',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 6px 12px rgba(0, 123, 255, 0.2)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {loading ? "Processing..." : "Claim Airdrop"}
        </button>
  
        {/* Message */}
        {message && (
          <p style={{ color: '#2980b9', fontSize: '1rem', marginTop: '15px' }}>
            {message}
          </p>
        )}
  
        {/* Airdrop Amount */}
        {airdropAmount && (
          <p style={{ fontSize: '1.2rem', fontWeight: '600', color: '#27ae60', marginTop: '10px' }}>
            Airdrop Amount: {airdropAmount} DLBRX
          </p>
        )}
      </div>
    );
  };
  
  export default ClaimAirdropByWalletAddress;