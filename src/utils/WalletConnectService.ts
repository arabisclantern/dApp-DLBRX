import WalletConnectProvider from "@walletconnect/web3-provider"; // Corrected provider import
import { ethers } from "ethers";

// Function to create a WalletConnect provider
export const createWalletConnectProvider = async () => {
  const provider = new WalletConnectProvider({
    rpc: {
      56: 'https://bsc-dataseed.binance.org/',  // BSC RPC URL (or replace with your desired RPC)
    },
    qrcode: true,  // Enable QR code scanning
  });

  await provider.enable();  // Call enable() to initialize the provider

  // Create a Web3 provider from the WalletConnect provider
  const web3Provider = new ethers.providers.Web3Provider(provider);
  const signer = web3Provider.getSigner();
  
  return { provider, signer };
};

// Function to send a transaction
export const sendTransaction = async (contract: ethers.Contract, signer: ethers.Signer) => {
  try {
    const tx = await contract.someMethod({ from: await signer.getAddress() }); // Corrected to get address
    console.log("Transaction sent:", tx);

    const receipt = await tx.wait();  // Wait for the transaction to be mined
    console.log("Transaction confirmed:", receipt);
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
};
