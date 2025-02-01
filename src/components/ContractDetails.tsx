import React, { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { IoMdStats, IoMdLink, IoMdCheckmarkCircleOutline } from 'react-icons/io';
import './ContractDetails.css'; // Ensure CSS file is imported

const ContractDetails: React.FC<{ contract: Contract }> = ({ contract }) => {
  const [maxSupply, setMaxSupply] = useState<string | null>(null);
  const [normalBurnRate, setNormalBurnRate] = useState<string | null>(null);
  const [normalTaxRate, setNormalTaxRate] = useState<string | null>(null);
  const [reducedBurnRate, setReducedBurnRate] = useState<string | null>(null);
  const [reducedTaxRate, setReducedTaxRate] = useState<string | null>(null);
  const [rewardPool, setRewardPool] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [lastBnbPrice, setLastBnbPrice] = useState<string | null>("Loading...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractDetails = async () => {
      setLoading(true);
      try {
        const maxSupply = await contract.MAX_SUPPLY();
        const normalBurnRate = await contract.NORMAL_BURN_RATE();
        const normalTaxRate = await contract.NORMAL_TAX_RATE();
        const reducedBurnRate = await contract.REDUCED_BURN_RATE();
        const reducedTaxRate = await contract.REDUCED_TAX_RATE();
        const rewardPool = await contract.rewardPool();
        const symbol = await contract.symbol();

        setMaxSupply((parseFloat(maxSupply.toString()) / 1e18).toFixed(2));
        setNormalBurnRate((normalBurnRate / 100).toFixed(2));
        setNormalTaxRate((normalTaxRate / 100).toFixed(2));
        setReducedBurnRate((reducedBurnRate / 100).toFixed(2));
        setReducedTaxRate((reducedTaxRate / 100).toFixed(2));
        setRewardPool((parseFloat(rewardPool.toString()) / 1e18).toFixed(2));
        setSymbol(symbol);

        setError(null);
      } catch (e: any) {
        setError(`Error fetching contract details: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [contract]);

  useEffect(() => {
    const fetchLiveBnbPrice = async () => {
      try {
        const price = await contract.getLatestBnbPrice();
        const formattedPrice = (price / 1e8).toFixed(2);
        setLastBnbPrice(formattedPrice);
      } catch (e: any) {
        setLastBnbPrice("Not available");
        setError(`Error fetching live BNB price: ${e.message}`);
      }
    };

    fetchLiveBnbPrice();
    const intervalId = setInterval(fetchLiveBnbPrice, 1000);

    return () => clearInterval(intervalId);
  }, [contract]);

  return (
    <div className="contract-details-container">
      <h3>
        Contract Details <IoMdStats style={{ color: '#007BFF' }} /> {' '}
        <span style={{ color: 'green', fontSize: '1rem' }}>
          Verified <IoMdCheckmarkCircleOutline style={{ color: 'green' }} />
        </span>
      </h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p>Max Supply: <span className="highlight-text">{maxSupply}</span></p>
      <p>Normal Burn Rate: <span className="highlight-text">{normalBurnRate}%</span></p>
      <p>Normal Tax Rate: <span className="highlight-text">{normalTaxRate}%</span></p>
      <p>Reduced Burn Rate: <span className="highlight-text">{reducedBurnRate}%</span></p>
      <p>Reduced Tax Rate: <span className="highlight-text">{reducedTaxRate}%</span></p>
      <p>Reward Pool: <span className="highlight-text">{rewardPool}</span></p>
      <p>Symbol: <span className="highlight-text">{symbol}</span></p>

      {/* Updated BNB Price Display Without USDT */}
      <p className="bnb-price">
        Last BNB Price: <span className="bnb-price-number">{lastBnbPrice}</span>
      </p>

      {/* Clickable Contract Address */}
      <p>Contract Address:{" "}
        <a
          href="https://bscscan.com/token/0x464fD44452BDBB188ec4d0a0b12D05ccd629e76d#code"
          target="_blank"
          rel="noopener noreferrer"
          className="contract-link"
        >
          0x464fD44452BDBB188ec4d0a0b12D05ccd629e76d
        </a>
      </p>

      {/* IPFS Hash */}
      <p>IPFS Hash:{" "}
        <span className="highlight-text">
          ipfs://e78a64c371c04abef3c6c7628cd4a673cd20c24c0efb8c73d23654ed845e2d38
        </span>
      </p>
    </div>
  );
};

export default ContractDetails;
