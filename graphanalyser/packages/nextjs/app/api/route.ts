import { createPublicClient, createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import deployedContracts from "~~/contracts/deployedContracts";

export async function POST(req: Request) {
  try {
    const reqData = await req.json();

    const privateKey = String(process.env.SYSTEM_PRIVATE_KEY);
    const account = privateKeyToAccount(`0x${privateKey}`);
    const walletClient = createWalletClient({
      account,
      chain: {
        id: Number(process.env.IPC_SUBNET_CHAIN_ID),
        name: "IPC_Subnet",
        nativeCurrency: {
          name: "Analyse",
          symbol: "ALY",
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [String(process.env.IPC_SUBNET_URL)],
            webSocket: undefined,
          },
          public: {
            http: [String(process.env.IPC_SUBNET_URL)],
            webSocket: undefined,
          },
        },
        network: "ipc-subnet",
      },
      transport: http(String(process.env.IPC_SUBNET_URL)),
    });
    const UserAnalytics = getContract({
      abi: deployedContracts[[process.env.IPC_SUBNET_CHAIN_ID] as unknown as keyof typeof deployedContracts]
        .UserAnalytics.abi,
      address:
        deployedContracts[[process.env.IPC_SUBNET_CHAIN_ID] as unknown as keyof typeof deployedContracts].UserAnalytics
          .address,
      walletClient,
    });

    const response = await UserAnalytics?.write.addAnalytics([String(reqData.connectedAddress), 1n, 1n]);
    console.log(response);
    return new Response(JSON.stringify({ data: response }));
  } catch (e) {
    console.log(e);
    return new Response("Server Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const stylusPublicClient = createPublicClient({
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

    const Recommender = getContract({
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
      publicClient: stylusPublicClient,
    });

    const idToAddressMap = {
      "0": "0x264f9EF85C21DE49451c3636116668889Ca41aab",
      "1": "0x7B4fd15B495b5700aF2C193f52D830e51C049366",
      "2": "0x5Be2DdD4f0d6ABC1915344351B8231998BB401C2",
      "3": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "4": "0x55Ae5e87C8be13EcA8db6dcD54EbCCd491A857F8",
      "5": "0x388C818CA8B9251b393131C08a736A67ccB19297",
      "6": "0x2C961d991bf94A7Eac84C453FaAE8614cb6b7F9B",
      "7": "0x7239bA00E03Fb9A8b8E4Eb5065aE2c35d759ba45",
      "8": "0x5f65f7b609678448494De4C87521CdF6cEf1e932",
      "9": "0xcCca379821A19F6E5224F511f1806D91a81Db6D3",
    };
    const response = await Recommender.read.getRecommendations([
      [
        [1n, 0n, 1n, 1n, 0n],
        [1n, 1n, 1n, 1n, 0n],
        [0n, 0n, 1n, 1n, 1n],
        [1n, 1n, 0n, 0n, 1n],
        [1n, 1n, 0n, 1n, 0n],
        [1n, 0n, 0n, 1n, 1n],
        [1n, 1n, 0n, 0n, 1n],
        [0n, 0n, 1n, 1n, 1n],
        [1n, 1n, 1n, 1n, 1n],
        [0n, 0n, 0n, 1n, 1n],
      ],
      1n,
      7n,
    ]);

    const result = response.map(i =>
      i.map(j => idToAddressMap[j.toString() as unknown as keyof typeof idToAddressMap]),
    );
    console.log(result);
    return new Response(
      JSON.stringify(
        { data: result },
        (key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
      ),
    );
  } catch (e) {
    console.log(e);
    return new Response("Server Error", { status: 500 });
  }
}
