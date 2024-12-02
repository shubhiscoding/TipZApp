"use client"
import React, { useState } from "react";
import { ethers } from "ethers";

const Tip: React.FC = () => {
  const [videoLink, setVideoLink] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [tipAmount, setTipAmount] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const CONTRACT_ADDRESS = "0x5f83f75aaD69507DD9285C2ADcF59Aa845173aa2"; 
  const CONTRACT_ABI = [
    "function tip(string memory username) public payable",
  ];

  const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const MIN_TIP_AMOUNT = 0.0000001;

  const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
  const UNICHAIN_SEPOLIA_RPC_URL = "https://sepolia.unichain.org";

  // Extract Video ID from YouTube URL (unchanged)
  const extractVideoId = (url : string) => {
    const urlObj = new URL(url);
  
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes("youtube.com")) {
      return urlObj.searchParams.get("v");
    }
    return null;
  };

  // Fetch Channel Info (unchanged)
  const fetchChannelInfo = async (videoId: string) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch video information');
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const channelId = data.items[0].snippet.channelId;
        setChannelId(channelId);
        return channelId;
      } else {
        throw new Error('No video found');
      }
    } catch (err) {
      console.error('Error fetching channel info:', err);
      setError('Failed to retrieve video information');
      return null;
    }
  };

  // Handle Video Link Input (unchanged)
  const handleVideoLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setVideoLink(link);
    
    const extractedVideoId = extractVideoId(link);
    if (extractedVideoId) {
      setVideoId(extractedVideoId);
      fetchChannelInfo(extractedVideoId);
    } else {
      setVideoId(null);
      setChannelId(null);
      setError('Invalid YouTube video link');
    }
  };

  const switchToUniChainSepolia = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${UNICHAIN_SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error) {
      // If the chain is not added, add it
      if ((error as { code: number }).code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: `0x${UNICHAIN_SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: "Unichain Sepolia Testnet",
              rpcUrls: [UNICHAIN_SEPOLIA_RPC_URL],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
              },
              blockExplorerUrls: ["https://sepolia.uniscan.xyz"]
            }]
          });

        } catch {
          throw new Error("Failed to add Unichain Sepolia network");
        }
      } else {
        throw error;
      }
    }
  };

  // Handle Tip Submission
  const handleTip = async () => {
    // Reset previous errors
    // setError(null);
    setTransactionHash(null);

    // Validate inputs
    if (!videoId) {
      setError('Please enter a valid YouTube video link');
      return;
    }

    const parsedTipAmount = parseFloat(tipAmount);
    if (isNaN(parsedTipAmount) || parsedTipAmount < MIN_TIP_AMOUNT) {
      setError(`Tip amount must be at least ${MIN_TIP_AMOUNT} ETH`);
      return;
    }

    if (!channelId) {
      setError('Could not retrieve channel information');
      return;
    }

    try {
      setIsProcessing(true);

      await switchToUniChainSepolia();

      // Create provider and get signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      // Create contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Convert tip amount to wei
      const tipInEther = ethers.parseEther(tipAmount);

      // Send tip to the channel
      const tx = await contract.tip(channelId, { value: tipInEther });
      await tx.wait();

      // Update UI
      setTransactionHash(tx.hash);
      
      // Reset form
      setVideoLink('');
      setVideoId(null);
      setChannelId(null);
      setTipAmount('');

    } catch (error) {
      console.error("Error while tipping:", error);
      
      // Handle specific error scenarios
      const err = error as Error;
      if (err.message.includes("User denied transaction signature")) {
        setError("Transaction was rejected");
      } else if (err.message.includes("Tip amount must be greater than")) {
        setError(`Tip amount must be at least ${MIN_TIP_AMOUNT} ETH`);
      } else {
        setError(err.message || "An error occurred while processing the tip");
      }
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <div className="flex flex-col w-[800px]">
      {/* Heading Section */}
      <h1 className="text-7xl font-semibold text-left">
        {['Seek partners', 'for influncer', 'collaboration'].map((line, index) => (
          <div
            key={index}
            className="bg-gradient-to-r from-[#74d8ff] via-[#ff54b2] to-[#ffa9b8] bg-clip-text text-transparent mb-3"
            style={{
              backgroundImage:
                "linear-gradient(to right, #74d8ff 20%, #ff54b2 30%, #ffa9b8 100%)",
            }}
          >
            {line}
          </div>
        ))}
      </h1>

      {/* Tip Your Fav Creator Section */}
      <div className="mt-10 border-dashed border-2 border-[#DADADA] rounded-lg p-6 w-[80%]">
        <h2 className="text-xl font-semibold mb-6 text-black">
          Tip your fav creator
        </h2>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col space-y-4">
          {/* Input for YouTube Video Link */}
          <input
            type="text"
            placeholder="Paste YouTube video link here"
            className="w-full px-4 py-3 text-black placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE6B8B] focus:border-transparent"
            value={videoLink}
            onChange={handleVideoLinkChange}
          />

          {/* Display Extracted Video ID and Channel ID
          {videoId && (
            <div className="text-sm text-gray-600">
              <p>Video ID: {videoId}</p>
              <p>Channel ID: {channelId || 'Fetching...'}</p>
            </div>
          )} */}

          {/* Input for Tip Amount */}
          <input
            placeholder="Enter tip amount (ETH)"
            className="w-full px-4 py-3 text-black placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE6B8B] focus:border-transparent"
            value={tipAmount || ''}
            onChange={(e) => setTipAmount(e.target.value)}
          />

          {/* Tip Button */}
          <button
            type="button"
            className="bg-gradient-to-r from-[#4f90aa] to-[#ff5d78] text-white font-medium py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
            onClick={handleTip}
            disabled={isProcessing || !videoId || !channelId || !tipAmount}
          >
            {isProcessing ? 'Processing...' : 'Tip Now'}
          </button>
        </form>

        {/* Transaction Success */}
        {transactionHash && (
          <div className="mt-4">
            <p className="text-green-600 semibold">
              Tip sent successfully!{" "}
              <a
                href={`https://sepolia.uniscan.xyz/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View on Uniscan
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tip;