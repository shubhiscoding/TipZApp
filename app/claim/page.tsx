"use client";
import { signIn, useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const CONTRACT_ABI = [
  "function ammountOfTip(string memory username) public view returns (uint256)"
];

const Claim_Contract_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "username", "type": "string" },
      { "internalType": "address", "name": "reciver", "type": "address" }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "0x5f83f75aaD69507DD9285C2ADcF59Aa845173aa2"; 

export default function Claim() {
  const { data: session } = useSession();
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  // State variables
  const [youtubeChannelId, setYoutubeChannelId] = useState<string | null>(null);
  const [availableTips, setAvailableTips] = useState<string>("0");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const UNICHAIN_SEPOLIA_CHAIN_ID = 1301;
  const UNICHAIN_SEPOLIA_RPC_URL = "https://sepolia.unichain.org";


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
  


  // Fetch YouTube Channel ID
  useEffect(() => {
    async function fetchYouTubeChannelId() {
      console.log("Fetching YouTube channel ID");
      if (session?.accessToken) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&access_token=${session.accessToken}`
          );
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            setYoutubeChannelId(data.items[0].id);
          }
        } catch {
          setError("Failed to fetch YouTube channel");
        }
      }
    }

    fetchYouTubeChannelId();
    //console.log()
  }, [session]);

  // Check available tips
  useEffect(() => {
    async function checkAvailableTips() {
      switchToUniChainSepolia();
      
      if (youtubeChannelId) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

          // Fetch tips using YouTube channel ID
          const tips = await contract.ammountOfTip(youtubeChannelId);
          setAvailableTips(ethers.formatEther(tips));
        } catch {
          setError("Failed to fetch available tips");
        }
      }
    }

    checkAvailableTips();
  }, [youtubeChannelId]);

  // Claim funds
  const claimFunds = async () => {
    setIsLoading(true);
    setError(null);
    setTransactionHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const user = await provider.getSigner();
      const signer = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY || '', provider);
      const walltAdd = await signer.getAddress();
      console.log(walltAdd);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, Claim_Contract_ABI, signer);

      // Hardcoded key for demonstration - replace with secure method
      const userAddress = await user.getAddress();
      const tx = await contract.withdraw(youtubeChannelId, userAddress);
      await tx.wait();
      setTransactionHash(tx.hash);
      // Reset tips after successful withdrawal
      setAvailableTips("0");
      alert("Funds successfully claimed!");
    } catch (err) {
      console.error("Failed to claim funds:", err);
      setError("Failed to claim funds");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold mb-4">Claim Your YouTube Creator Rewards</h1>
          <p className="mb-6">Sign in with Google to access your tips</p>
          <button 
            onClick={() => signIn('google')} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Claim Rewards</h1>
          <button 
            onClick={() => signOut()} 
            className="text-sm text-red-500 hover:underline"
          >
            Sign Out
          </button>
        </div>

        <div className="text-center mb-6">
          <p className="font-semibold">{session.user?.name}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-semibold mb-2">Available Tips</h2>
          <p className="text-3xl font-bold text-green-600">{availableTips} ETH</p>
        </div>

        <button 
          onClick={claimFunds}
          disabled={isLoading || parseFloat(availableTips) === 0}
          className={`w-full py-3 rounded transition ${
            parseFloat(availableTips) > 0 && !isLoading 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Claiming...' : 'Claim Funds'}
        </button>

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

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
}