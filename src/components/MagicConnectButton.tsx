import { useState } from 'react';
import { connectMagicWallet, magic } from '../utils/magic'; // Ensure magic is imported here
import { Mail } from 'lucide-react';

type WalletConnectionProps = {
  onConnected: (data: { userAddress: string; signer: any }) => void;
};

const MagicConnectButton = ({ onConnected }: WalletConnectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");  // Track email input
  const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);  // Track if email is submitted
  const [error, setError] = useState("");  // To track and display any error

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");  // Reset error on change
  };

  const handleConnect = async () => {
    if (!email) {
      setError('Email is required!');
      return;
    }

    // Email validation (basic check)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Sending Magic Link to:', email);
      await magic.auth.loginWithMagicLink({ email });

      console.log('Magic Link sent to:', email);

      const { userAddress, signer } = await connectMagicWallet(email);

      if (onConnected) {
        onConnected({ userAddress, signer });
      }

      alert(`Wallet connected successfully: ${userAddress}`);
      setIsEmailSubmitted(true);  // After successful login, mark email as submitted
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Failed to connect Magic Wallet. Please check your Magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isEmailSubmitted ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            disabled={isLoading}
            aria-label="Email address"
            className="email-input"  // You can add styles here for consistency
          />
          <button 
            onClick={handleConnect} 
            disabled={isLoading} 
            aria-label="Send Magic Link"
            className="magic-login-btn"
          >
            {isLoading ? 'Sending Magic Link...' : 'Send Magic Link'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      ) : (
        <p>
          Please check your email and click on the Magic Link to log in.
        </p>
      )}
    </div>
  );
};

export default MagicConnectButton;
