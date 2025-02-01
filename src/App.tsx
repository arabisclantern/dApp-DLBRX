import React, { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { ethers } from 'ethers';
import logo from './images/my-logo.png';
import metamaskLogo from './images/metamask-logo.png';
import './App.css';
import MyContractABI from './utils/MyContract.json';
import { Magic } from 'magic-sdk';
import WalletConnectProvider from '@walletconnect/web3-provider';

// Lazy load components
const ClaimAirdrop = lazy(() => import('./components/ClaimAirdrop'));
const StakeTokens = lazy(() => import('./components/StakeTokens'));
const UnstakeTokens = lazy(() => import('./components/UnstakeTokens'));
const ClaimReward = lazy(() => import('./components/ClaimReward'));
const ContractDetails = lazy(() => import('./components/ContractDetails'));
const ClaimAirdropByWalletAddress = lazy(() => import('./components/ClaimAirdropByWalletAddress'));
const WalletConnectBox = lazy(() => import('./components/WalletConnectBox'));

const contractAddress = "0x464fD44452BDBB188ec4d0a0b12D05ccd629e76d";
const magic = new Magic('pk_live_43C162369CA2D8DD');

const App: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>('');
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [loginComplete, setLoginComplete] = useState(false);
  const [isAddressConnected, setIsAddressConnected] = useState(false); // Track address connection

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || /@gmail\.com$/.test(email);

  // Connect using a direct wallet address
  const connectDirectAddress = useCallback(async () => {
    try {
      const provider = new ethers.providers.JsonRpcProvider('https://bsc-dataseed.binance.org/');
      const signer = provider.getSigner(userAddress);
      const contract = new ethers.Contract(contractAddress, MyContractABI, provider).connect(signer);
      setSigner(signer);
      setContract(contract);
      setUser(userAddress);
      setError(null);
      setIsAddressConnected(true); // Update to hide the connection box
    } catch (err: any) {
      setError(`💥 An error occurred during direct address connection: ${err.message}`);
    }
  }, [userAddress]);

  // Connect using MetaMask
  const connectMetaMask = useCallback(async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const userAddress = await signer.getAddress();
        const contract = new ethers.Contract(contractAddress, MyContractABI, signer);

        setSigner(signer);
        setContract(contract);
        setUser(userAddress); // Update user state
        setError(null);
        setIsAddressConnected(true); // Update to hide the connection box
      } else {
        setMetaMaskInstalled(false);
        setError('😞 MetaMask is not installed. Please install MetaMask to proceed!');
      }
    } catch (err: any) {
      setError(`💥 Oops! Something went wrong: ${err.message}`);
    }
  }, []);

  // Connect using Magic Wallet
  const connectMagicWallet = useCallback(async () => {
    if (!isValidEmail) {
      setError('🌍 Join us in the fight against inflation! DollarBrics is here to change the game — don’t miss out on this incredible opportunity to grow your wealth while inflation works against you.');
      return;
    }
    try {
      await magic.auth.loginWithMagicLink({ email });
      const provider = new ethers.providers.Web3Provider(magic.rpcProvider as unknown as ethers.providers.ExternalProvider);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, MyContractABI, signer);

      setSigner(signer);
      setContract(contract);
      setUser(userAddress);
      setLoginComplete(true);
      setIsAddressConnected(true); // Update to hide the connection box
      setError(null);
    } catch (err: any) {
      setError(`💥 An error occurred during Magic Wallet login: ${err.message}`);
    }
  }, [email, isValidEmail]);

  // Connect using WalletConnect
  const connectWalletConnect = useCallback(async () => {
    setLoading(true); // Start loading indicator
    try {
      const provider = new WalletConnectProvider({
        rpc: {
          56: 'https://bsc-dataseed.binance.org/', // BSC RPC URL
        },
        qrcode: true, // Enable QR code
      });

      await provider.enable();
      const web3Provider = new ethers.providers.Web3Provider(provider);
      const signer = web3Provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(contractAddress, MyContractABI, signer);

      setSigner(signer);
      setContract(contract);
      setUser(userAddress);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message.includes('User closed QR Code Modal')
        ? '🚫 You closed the QR Code Modal. Please try again.'
        : `💥 An error occurred during WalletConnect login: ${err.message}`;
      setError(errorMessage);
    } finally {
      setLoading(false); // End loading indicator
    }
  }, []);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setUser(accounts[0]); // Update user state
        } else {
          setUser(null); // No accounts connected (user disconnected)
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup event listener on component unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Initialize provider on component mount
  useEffect(() => {
    const initProvider = async () => {
      setLoading(true);
      if (window.ethereum) {
        setMetaMaskInstalled(true);
        await connectMetaMask();
      } else {
        await connectMagicWallet();
      }
      setLoading(false);
    };
    initProvider();
  }, [connectMetaMask, connectMagicWallet]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') event.preventDefault();
  };

  const handleSendClick = () => setShowPrompt(true);

  const handleCloseLogin = () => setLoginComplete(false);

  return (
    <div className="App container">
      {/* The entire content of your app goes here */}
      <div className="App">
        {error && (
          <div
            style={{
              marginTop: '10px',
              color: '#5f6368', // Silver color for error message
              backgroundColor: '#f0f0f5', // Light silver background
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #5f6368',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
        {!isValidEmail && !error && (
          <div
            style={{
              marginTop: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#007BFF', // Blue color for message
              backgroundColor: '#e1f5fe', // Light blue background
              padding: '10px',
              borderRadius: '8px',
              border: '1px solidrgb(47, 108, 174)',
              textAlign: 'center',
            }}
          >
            🌍 Join us in the fight against inflation! DollarBrics is here to change the game — don’t miss out on this incredible opportunity to grow your wealth while inflation works against you.
          </div>
        )}

        {loading && <p>⏳ Loading, please wait...</p>}
        
        <header className="App-header">
          <h1 className="App-title">Welcome to DollarBrics</h1>
          <h2 className="App-symbol">DLBRX</h2>
          <div className="flex-container">
            <div className="interaction-wrapper">
              {!isAddressConnected && (
                <div className="address-login red-box central-zone">
                  <input
                    type="text"
                    placeholder="Enter your wallet address to connect the contract"
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    className="address-input red-input"
                  />
                  <button
                    onClick={connectDirectAddress}
                    disabled={!ethers.utils.isAddress(userAddress)}
                    className="address-login-btn red-btn"
                  >
                    Connect with Address
                  </button>
                  <p className="supply-info">
                    The total supply of tokens is 7.0 billion, with an intrinsic burn mechanism that will
                    gradually reduce the supply down to 700 million tokens. Initially, 99% of the tokens
                    are held by the contract, and no one can mint any more tokens. Everything is set up to
                    ensure fair distribution—read more in our{' '}
                    <a
                      href="https://bscscan.com/token/0x464fD44452BDBB188ec4d0a0b12D05ccd629e76d#code"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      contract on BscScan
                    </a>{' '}
                    and check out the full details in the{' '}
                    <a href="path/to/whitepaper" target="_blank" rel="noopener noreferrer">
                      whitepaper
                    </a>!
                  </p>
                </div>
              )}

              <Suspense fallback={<div>Loading...</div>}>
                <ClaimAirdrop />
                <ClaimAirdropByWalletAddress contract={contract} signer={signer} />
                {contract && signer && (
                  <>
                    <StakeTokens contract={contract} signer={signer} />
                    <UnstakeTokens contract={contract} signer={signer} />
                    <ClaimReward contract={contract} signer={signer} />
                  </>
                )}
              </Suspense>
            </div>
            <div className="central-zone">
              <img src={logo} className="App-logo" alt="logo" />
            </div>
            <div className="details-wrapper">
              {contract && (
                <Suspense fallback={<div>Loading...</div>}>
                  <ContractDetails contract={contract} />
                </Suspense>
              )}
            </div>
          </div>

          {!isAddressConnected && ( // Only show connection box if not connected
            <div className="wallet-connection-box">
              <p
                style={{
                  fontSize: '1.5rem',
                  color: '#2c3e50',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                Connect with:
              </p>
              <div className="connect-buttons">
                {metaMaskInstalled && (
                  <button onClick={connectMetaMask} className="metamask-btn">
                    <img src={metamaskLogo} alt="MetaMask Wallet" className="metamask-logo" />
                    MetaMask Wallet
                  </button>
                )}
                <p
                  style={{
                    fontSize: '1.2rem',
                    color: '#7f8c8d',
                    margin: '10px 0',
                  }}
                >
                  OR
                </p>
                <div className="magic-login">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="email-input"
                  />
                  <button
                    onClick={connectMagicWallet}
                    disabled={!isValidEmail}
                    className="magic-login-btn"
                  >
                    Login with Magic
                  </button>
                </div>
                <p
                  style={{
                    fontSize: '1.2rem',
                    color: '#7f8c8d',
                    margin: '10px 0',
                  }}
                >
                  OR
                </p>
                <Suspense fallback={<div>Loading...</div>}>
                  <WalletConnectBox onConnect={connectWalletConnect} />
                </Suspense>
              </div>
            </div>
          )}
        </header>
      </div>
    </div>
  );
};

export default App;