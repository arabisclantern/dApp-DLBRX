"use client";

import React, { useState, useEffect, useCallback } from "react";
import { parseUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

const StakeTokens: React.FC<{ signer: any; contract: Contract }> = ({ signer, contract }) => {
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userStake, setUserStake] = useState<BigNumber>(BigNumber.from(0));
  const [rewardPool, setRewardPool] = useState<BigNumber>(BigNumber.from(0));
  const [totalRewardsDistributed, setTotalRewardsDistributed] = useState<BigNumber>(BigNumber.from(0));

  const fetchStakeInfo = useCallback(async () => {
    if (signer && contract) {
      try {
        const userAddress = await signer.getAddress();
        const userStake = (await contract.stakes(userAddress)).amount;
        const rewardPool = await contract.rewardPool();
        const totalRewardsDistributed = await contract.totalRewardsDistributed();

        setUserStake(userStake);
        setRewardPool(rewardPool);
        setTotalRewardsDistributed(totalRewardsDistributed);
      } catch (e: any) {
        console.error(`Error fetching stake info: ${e.message}`);
      }
    }
  }, [contract, signer]);

  useEffect(() => {
    fetchStakeInfo();
  }, [fetchStakeInfo]);

  const stakeTokens = async (amount: string) => {
    if (!contract || !signer) {
      setMessage("Contract or signer is not initialized.");
      return;
    }

    setLoading(true);

    try {
      await fetchStakeInfo();

      const parsedAmount = parseUnits(amount, 18);
      const maxStake = BigNumber.from("70000000000000000000000");
      const totalRewardCap = BigNumber.from("70000000000000000000000000");
      const totalStakes = userStake.add(parsedAmount);

      if (totalStakes.gt(maxStake)) {
        setMessage("Exceeds the maximum stake limit of 70,000 tokens.");
        setLoading(false);
        return;
      }

      if (totalRewardsDistributed.gte(totalRewardCap)) {
        setMessage("Reward cap exceeded.");
        setLoading(false);
        return;
      }

      if (rewardPool.lte(0)) {
        setMessage("Insufficient reward pool.");
        setLoading(false);
        return;
      }

      const tx = await contract.stake(parsedAmount, {
        gasLimit: 500000 
      });
      await tx.wait();

      setMessage(`Successfully staked ${amount} tokens!`);
      await fetchStakeInfo();
    } catch (e: any) {
      if (e.code === 'ACTION_REJECTED') {
        setMessage("Transaction rejected by user.");
      } else {
        setMessage(`Error staking tokens: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  

    return (
      <div>
        <h3>Stake Tokens <IoMdCheckmarkCircleOutline /></h3> {/* Add icon */}
        {loading && <p>Loading...</p>}
        {message && <p style={{ color: 'blue', fontSize: 'small' }}>{message}</p>}
        <input 
          type="text" 
          placeholder="Amount" 
          value={stakeAmount} 
          onChange={(e) => setStakeAmount(e.target.value)} 
          style={{ 
            fontSize: '1.2rem', 
            padding: '8px 16px', 
            width: '60%', 
            borderRadius: '10px', 
            border: '2px solid #e0e0e0', 
            marginBottom: '20px' 
          }} 
        />
        <button 
          onClick={() => stakeTokens(stakeAmount)} 
          style={{ 
            fontSize: '1.5rem', 
            padding: '10px 20px', 
            backgroundColor: '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px' 
          }} 
        > 
          Stake 
        </button>
      </div>
    );
  };
  
  export default StakeTokens;
  