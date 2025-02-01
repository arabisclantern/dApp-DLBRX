import React, { useState } from 'react';
import { connectMagicWallet } from '../utils/magic'; // Import your Magic connection function

const MagicLogin = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [userAddress, setUserAddress] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleLogin = async () => {
    if (!email) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setMessage('Sending Magic Link...');
    try {
      const { signer, userAddress, provider } = await connectMagicWallet(email);
      setMessage('Magic Link sent! Please check your inbox.');
      setUserAddress(userAddress);
      console.log('User Address:', userAddress); // Use the user address for any contract interaction.
    } catch (error) {
      setMessage('Failed to send Magic Link. Please try again.');
      console.error(error);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={handleEmailChange}
        placeholder="Enter your email"
      />
      <button onClick={handleLogin}>Login with Magic</button>
      <p>{message}</p>
      {userAddress && <p>User Address: {userAddress}</p>}
    </div>
  );
};

export default MagicLogin;
