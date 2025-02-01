import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';

const magic = new Magic('pk_live_43C162369CA2D8DD', {
  network: {
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: 56,
  },
});

/**
 * Function to connect with Magic Wallet
 * @param {string} email - The email address of the user.
 * @returns {Promise<{signer: ethers.Signer, userAddress: string, provider: ethers.providers.Web3Provider}>}
 */
const connectMagicWallet = async (email) => {
  try {
    if (!email) throw new Error('Email is required to connect to Magic Wallet.');

    // Use Magic's loginWithMagicLink method
    await magic.auth.loginWithMagicLink({ email });

    // Create a provider and signer for ethers.js
    const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
    const signer = provider.getSigner();
    const userAddress = await signer.getAddress();

    return {
      signer,
      userAddress,
      provider,
    };
  } catch (error) {
    console.error('Magic Wallet connection failed:', error);
    throw error;
  }
};

export { magic, connectMagicWallet };
