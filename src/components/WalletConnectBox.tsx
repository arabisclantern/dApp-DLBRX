import React, { useEffect, useState } from 'react';
import './WalletConnectBox.css';
import WalletConnectQR from './WalletConnectQR';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';

interface WalletConnectBoxProps {
  onConnect: (web3: any) => void;
}

const WalletConnectBox: React.FC<WalletConnectBoxProps> = ({ onConnect }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const walletConnectProvider = new WalletConnectProvider({
          rpc: {
            56: 'https://bsc-dataseed.binance.org/',
          },
          qrcode: false,
        });

        walletConnectProvider.connector.on('display_uri', (err, payload) => {
          if (err) {
            throw err;
          }
          setLoading(false);
        });

        await walletConnectProvider.enable();
        const web3Provider = new ethers.providers.Web3Provider(walletConnectProvider);
        onConnect(web3Provider);
      } catch (err: any) {
        console.error('Error during WalletConnect connection:', err);
        setError(`An error occurred during WalletConnect login: ${err.message}`);
        setLoading(false);
      }
    };

    connectWallet();
  }, [onConnect]);

  return (
    <div className="walletconnect-box">
      {loading && <p>Generating QR Code...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && (
        <div className="walletconnect-qr-container">
          <WalletConnectQR
            message="Scan the QR code to connect with WalletConnect"
            onConnect={onConnect}
          />
        </div>
      )}
    </div>
  );
};

export default WalletConnectBox;
