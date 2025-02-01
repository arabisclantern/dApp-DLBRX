import React, { useState, useEffect } from 'react';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Web3 from 'web3';
import { QRCodeCanvas } from 'qrcode.react';

interface WalletConnectQRProps {
  message: string;
  onConnect: (web3: any) => void;
}

const WalletConnectQR: React.FC<WalletConnectQRProps> = ({ message, onConnect }) => {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeProvider = async () => {
      const provider = new WalletConnectProvider({
        rpc: {
          56: 'https://bsc-dataseed.binance.org/',
        },
        qrcode: false,
      });

      provider.connector.on('display_uri', (err, payload) => {
        if (err) {
          console.error('Error displaying QR code:', err);
          setLoading(false);
          return;
        }
        setUri(payload.params[0]);
      });

      try {
        await provider.enable();
        const web3 = new Web3(provider);
        onConnect(web3);
        setLoading(false);
      } catch (error) {
        console.error('Error enabling WalletConnect:', error);
        setLoading(false);
      }
    };

    initializeProvider();
  }, [onConnect]);

  return (
    <div className="walletconnect-qr-box">
      {loading && <p>Generating QR Code...</p>}
      {uri && (
        <div className="qr-code-container">
          <QRCodeCanvas value={uri} size={256} />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default WalletConnectQR;
