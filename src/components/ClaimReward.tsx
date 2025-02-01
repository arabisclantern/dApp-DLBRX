"use client";

import React, { useState } from "react";
import { Contract } from "@ethersproject/contracts"; 
import { IoMdGift } from "react-icons/io";

const ClaimReward: React.FC<{ signer: any; contract: Contract }> = ({ signer, contract }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); 

  const claimStakingReward = async () => {
    if (!contract || !signer) {
      setMessage("Contract or signer is not initialized.");
      return;
    }

    setLoading(true);

    try {
      const tx = await contract.claimReward({
        gasLimit: 500000
      });
      await tx.wait();

      setMessage("Successfully claimed staking reward!");
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED') {
        setMessage("Transaction rejected by user.");
      } else {
        setMessage(`Error claiming reward: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Claim Reward <IoMdGift /></h3>
      {loading && <p>Loading...</p>}
      {message && <p style={{ color: 'blue', fontSize: 'small' }}>{message}</p>}
      <button 
        onClick={claimStakingReward}
        style={{ 
          fontSize: '1.5rem', 
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '8px'
        }}>
        Claim Reward
      </button>
    </div>
  );
};

export default ClaimReward;
