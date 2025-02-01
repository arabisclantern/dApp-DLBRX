"use client";

import React, { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "@ethersproject/units";
import { Contract } from "@ethersproject/contracts";
import { IoMdRemoveCircleOutline } from "react-icons/io";

const UnstakeTokens: React.FC<{ signer: any; contract: Contract }> = ({ signer, contract }) => {
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStakeInfo = async () => {
      if (signer && contract) {
        try {
          const userAddress = await signer.getAddress();
          const userStake = (await contract.stakes(userAddress)).amount;
          const formattedStake = formatUnits(userStake, 18); // Convert to a readable string format

          setUnstakeAmount(formattedStake); // Set the correctly formatted string value
        } catch (e: any) {
          console.error(`Error fetching stake info: ${e.message}`);
        }
      }
    };

    fetchStakeInfo();
  }, [signer, contract]);

  const unstakeTokens = async (amount: string) => {
    if (!contract || !signer) {
      setMessage("Contract or signer is not initialized.");
      return;
    }

    setLoading(true);

    try {
      const parsedAmount = parseUnits(amount, 18);

      const tx = await contract.unstake(parsedAmount, {
        gasLimit: 500000  // Set a manual gas limit
      });
      await tx.wait();

      setMessage(`Successfully unstaked ${amount} tokens!`);
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED') {
        setMessage("Transaction rejected by user."); // Simplified message
      } else {
        setMessage(`Error unstaking tokens: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
    return (
      <div>
        <h3>Unstake Tokens <IoMdRemoveCircleOutline /></h3> {/* Add icon */}
        {loading && <p>Loading...</p>}
        {message && <p style={{ color: 'blue', fontSize: 'small' }}>{message}</p>}
        <input
          type="text"
          placeholder="Amount"
          value={unstakeAmount}
          onChange={(e) => setUnstakeAmount(e.target.value)}
          style={{ 
            fontSize: '1.2rem', 
            padding: '8px 16px', 
            width: '57%',  /* Matching Stake Tokens input width */
            borderRadius: '10px', 
            border: '2px solid #e0e0e0', 
            marginBottom: '20px' 
          }}
        />
        <button 
          onClick={() => unstakeTokens(unstakeAmount)} 
          style={{ 
            fontSize: '1.5rem', 
            padding: '10px 20px', 
            backgroundColor: '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px' 
          }}>
          Unstake
        </button>
      </div>
    );
  };
  
  export default UnstakeTokens;
  