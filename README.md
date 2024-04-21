# OpenAnalyse

## Project Description

OpenAnalyse is an on-chain analytics platform that incentivizes users to share their activity metrics onchain. The current AI ecosystem is a black box and this project aims to eliminate this by introducing complete transparency in the way user data is collected and used.

OpenAnalyse creates an on-chain library of user activity matrix by assigning a data score to the activity performed by users on multiple dapps. The users first permit dapp by on-chain attestations to share their data and get incentivized in return. These data points of the users across multiple dapps get aggregated onchain and an unsupervised ML algorithm (KNN) is used to compute analytics on that data. Once the KNN clustering is performed the resulting output is used for recommendations of followers, social posts, etc. The dapp gets credits for sharing the user's data and those credits are utilized for fetching onchain recommendations.

## How it's Made

The core technologies used for building this product are -

- Arbitrum Stylus for computing on-chain analytics
- IPC Subnet for data consumption layer
- Sign Protocol for user permissions

The user first permits dapp to share their data through onchain attestations using Sign Protocol. The schema used for attestation includes the dapp name, the analytics details being broadcasted and user address. Once the dapp gets the required permissions they can share the data onchain and users get incentivised for sharing data.

The IPC subnet is used as the users' data consumption and incentivization layers because it consumes minimal gas fees and integration with FVM supports decentralized storage of user's data. The dapps share data over the IPC subnet and users get incentivized through appchain - native tokens. Once the data is aggregated on IPC subnet through multiple dapps they can be used for computing analytics on Arbitrum Stylus.

We leverage the computation capability of Arbitrum Stylus VM for the onchain computation of ML algorithms on the data collected by the users. The data collected by users is exported to Arbitrum Stylus and the Stylus smart contract computes KNN clustering on the data and calculates the nearest neighbors based on the activity scores across multiple dapps. These nearest neighbors are the recommended followers of the user predicted by Stylus contract.

## Project structure

- stylus-graph-packets - this folder contains the Arbitrum Stylus smart contract used to compute analytics and give out recommendations
- graphanalyser - contains the frontend and smart contracts used to share users data
- OpenAnalyseLib - the node.js sdk used to interact with OpenAnalyse Protocol
- ipc - this is the IPC subnet which is the data layer of OpenAnalyse
- ipc-contracts/data-sharing-contract - contract deployed on IPC Subnet used for data sharing by users

#################################

#

# Deployed IPC Subnet details

#

#################################

Subnet ID:
/r314159/t410f5cra5lwc4qbdpeuvdqh5hnjlyb52flcs7d32szq

Eth API:
http://0.0.0.0:8545

Chain ID:
4357475745646590

Fendermint API:
http://localhost:26658

CometBFT API:
http://0.0.0.0:26657

CometBFT node ID:
3122b96a28bbbf544b8bbc8f23b8a4433e94ef71

CometBFT P2P:
http://0.0.0.0:26656

IPLD Resolver Multiaddress:
/ip4/0.0.0.0/tcp/26655/p2p/16Uiu2HAkxeRYj1imvfo53YqZuEcJm7DZTQWmdhAtHPcEz5mDqRe8
