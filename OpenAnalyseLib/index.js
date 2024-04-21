import { createPublicClient, createWalletClient, getContract, http } from "viem";

class Analyse {
  constructor(analyse) {
    this.account = analyse.account;
    this.IPCWalletClient = createWalletClient({
      account: this.account,
      chain: {
        id: Number(analyse.ipcSubnetChainID),
        name: "IPC_Subnet",
        nativeCurrency: {
          name: "Analyse",
          symbol: "ALY",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [String(analyse.ipcSubnetUrl)],
            webSocket: undefined,
          },
          public: {
            http: [String(analyse.ipcSubnetUrl)],
            webSocket: undefined,
          },
        },
        network: "ipc-subnet",
      },
      transport: http(),
    });
    this.IPCAnalyticsContract = getContract({
      abi: [],
      address: "",
      walletClient: this.IPCWalletClient,
    }); 
    this.stylusClient = createPublicClient({
      chain: {
        id: 23011913,
        name: "Arbitrum Stylus",
        nativeCurrency: {
          name: "Ethereum",
          symbol: "ETH",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: ["https://stylus-testnet.arbitrum.io/rpc"],
            webSocket: undefined,
          },
          public: {
            http: ["https://stylus-testnet.arbitrum.io/rpc"],
            webSocket: undefined,
          },
        },
        network: "arbitrum-stylus",
      },
      transport: http("https://stylus-testnet.arbitrum.io/rpc"),
    });

    this.recommender = getContract({
      abi: [
        {
          inputs: [
            {
              internalType: "address",
              name: "user_address",
              type: "address",
            },
            {
              internalType: "int64",
              name: "action_index",
              type: "int64",
            },
            {
              internalType: "int64",
              name: "points",
              type: "int64",
            },
          ],
          name: "addAnalytics",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "user_address",
              type: "address",
            },
            {
              internalType: "int64[]",
              name: "initial_vector",
              type: "int64[]",
            },
          ],
          name: "addUser",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "int64[][]",
              name: "user_activity_matrix",
              type: "int64[][]",
            },
            {
              internalType: "int64",
              name: "user_index",
              type: "int64",
            },
            {
              internalType: "int64",
              name: "k",
              type: "int64",
            },
          ],
          name: "getRecommendations",
          outputs: [
            {
              internalType: "int64[][]",
              name: "",
              type: "int64[][]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      address: "0xC8E1aAAD08d00CbF456c880fcBAcc004cC99fbC1",
      publicClient: this.stylusClient,
    });
  }

  async sendAnalytics(analyticsInput) {
    try {
      const tx = await this.IPCAnalyticsContract.write.addAnalytics([String(analyticsInput.user), BigInt(analyticsInput.category), BigInt(analyticsInput.score)]);
      return tx;
    } catch(e) {
      throw new Error(e);
    }
  }

  async getRecommendedFollowers(recommenderInput) {
    try {
      const userActivityMatrix = await this.IPCAnalyticsContract.read.getUserActivityMatrix();
      const userId = await this.IPCAnalyticsContract.read.addressToId(recommenderInput.user);
      const response = await this.recommender.read.getRecommendations([
        userActivityMatrix,
        userId,
        recommenderInput.number,
      ]);
  
      const result = response.map(i =>
        i.map(async (j) => {
          const userAddress = await this.IPCAnalyticsContract.read.idToAddress(j);
          return userAddress;
        }),
      );

      return result;
    } catch(e) {
      throw new Error(e)
    }
  }
}