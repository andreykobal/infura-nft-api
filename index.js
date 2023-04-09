// index.js
// Import the libraries and load the environment variables.
const { SDK, Auth, TEMPLATES, Metadata } = require('@infura/sdk');
const express = require('express');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 3000;

// Create Auth object
const auth = new Auth({
  projectId: process.env.INFURA_API_KEY,
  secretId: process.env.INFURA_API_KEY_SECRET,
  privateKey: process.env.WALLET_PRIVATE_KEY,
  rpcUrl: process.env.EVM_RPC_URL,
  chainId: 137, // Polygon
});

// Instantiate SDK
const sdk = new SDK(auth);

app.get('/tokenMetadata', async (req, res) => {
  const { contractAddress, walletAddress } = req.query;

  if (!contractAddress || !walletAddress) {
    return res.status(400).send('contractAddress and walletAddress are required');
  }

  try {
    const mynfts = await sdk.api.getNFTs({ publicAddress: walletAddress });
    const metadataPromises = [];

    for (const nft of mynfts.assets) {
      if (nft.contract === contractAddress) {
        metadataPromises.push(sdk.api.getTokenMetadata({
          contractAddress: nft.contract,
          tokenId: nft.tokenId,
        }));
      }
    }

    const metadataArray = await Promise.all(metadataPromises);
    res.status(200).json(metadataArray);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error fetching token metadata');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});