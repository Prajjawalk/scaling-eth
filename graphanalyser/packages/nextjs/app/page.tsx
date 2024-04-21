"use client";

import { useEffect, useState } from "react";
import { sources } from "next/dist/compiled/webpack/webpack";
import Link from "next/link";
import { EvmChains, IndexService, SignProtocolClient, SpMode } from "@ethsign/sp-sdk";
import type { NextPage } from "next";
import { CodeBlock, atomOneDark } from "react-code-blocks";
import { useAccount, useWalletClient } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Sociogram from "~~/components/Sociogram";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [attestationId, setAttestationId] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [aloading, setALoading] = useState(false);
  const [nodes, setNodes] = useState([{ id: `${connectedAddress?.slice(0, 5)}...${connectedAddress?.slice(38, 42)}` }]);
  const [links, setLinks] = useState([
    {
      source: `${connectedAddress?.slice(0, 5)}...${connectedAddress?.slice(38, 42)}`,
      target: `${connectedAddress?.slice(0, 5)}...${connectedAddress?.slice(38, 42)}`,
    },
  ]);
  const [analyticsTx, setAnalyticsTx] = useState<string>();

  useEffect(() => {
    const indexService = new IndexService("testnet");
    const getAttestation = async () => {
      const res = await indexService.queryAttestationList({
        schemaId: String(process.env.NEXT_PUBLIC_SCHEMA_ID),
        attester: connectedAddress,
        mode: "onchain",
        page: 1,
      });

      if (res.rows.length > 0 && res.rows[0].attester == connectedAddress) {
        setAttestationId(res.rows[0].attestationId);
      }
    };
    getAttestation();
  }, [connectedAddress]);

  let signProtocolClient: SignProtocolClient;
  if (connectedAddress) {
    signProtocolClient = new SignProtocolClient(SpMode.OnChain, {
      chain: EvmChains.sepolia,
    });
  }

  // create attestation
  const handleCreateAttestation = async () => {
    setIsLoading(true);
    const createAttestationRes = await signProtocolClient.createAttestation({
      schemaId: "0x2f", //String(process.env.NEXT_PUBLIC_SCHEMA_ID),
      data: { name: "example-site", site: "https://www.example.com", type: "gaming", user: connectedAddress },
      indexingValue: Date.now().toString(),
    });

    if (createAttestationRes.attestationId) {
      setIsLoading(false);
      setAttestationId(createAttestationRes.attestationId);
    }
  };

  const handleShareAnalytics = async () => {
    setALoading(true);
    try {
      const result = await fetch("/api", {
        method: "POST",
        body: JSON.stringify({
          connectedAddress: connectedAddress,
        }),
      });
      const tx = await result.json();
      setALoading(false);
      setAnalyticsTx(tx.data);
    } catch (e) {
      setALoading(false);
      console.log(e);
    }
  };

  const handleGetRecommendations = async (type: number) => {
    try {
      const result = await fetch("/api", {
        method: "GET",
      });
      const recommendations = await result.json();
      const recommended_followers = recommendations.data[type];
      let follower_nodes = [{ id: `${connectedAddress?.slice(0, 5)}...${connectedAddress?.slice(38, 42)}` }];
      let follower_links = [];
      recommended_followers.map((i: string) => {
        follower_nodes.push({ id: `${i?.slice(0, 5)}...${i?.slice(38, 42)}` });
      });
      recommended_followers.map((i: string) => {
        follower_links.push({
          source: `${connectedAddress?.slice(0, 5)}...${connectedAddress?.slice(38, 42)}`,
          target: `${i?.slice(0, 5)}...${i?.slice(38, 42)}`,
        });
      });
      setNodes(follower_nodes);
      setLinks(follower_links);
    } catch (e) {
      console.log(e);
    }
  };

  const graphData = {
    nodes: nodes,
    links: links,
  };

  const showLineNumbers = true;
  const wrapLines = true;
  const codeBlock = true;

  const code = `
import { Analyse } from 'openanalyse';
import { 
  privateKeyToAccount 
} from 'viem/accounts';

const analyse = new Analyse({
  account: privateKeyToAccount('privateKey'),
})

// user analytics score
const point = 1;
const address = 'user-address';
// one out of [0,1,2,3,4]
const category = 2

analyse.sendAnalytics({
  user: address,
  category: category,
  score: point
})
`;

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Open Analyse Demo</span>
            {/* <span className="block text-4xl font-bold">Scaffold-ETH 2</span> */}
          </h1>
          <div className={`grid grid-cols-2 px-6 lg:px-10 lg:gap-12 w-full max-w-7xl my-0`}>
            <div className="col-span-1 grid grid-cols-1 gap-10">
              <div className="col-span-1 flex flex-col">
                <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
                  <div className="flex">
                    <div className="font-mono">
                      <CodeBlock
                        text={code}
                        language={"jsx"}
                        theme={atomOneDark}
                        {...{ showLineNumbers, wrapLines, codeBlock }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 grid grid-cols-1 gap-10">
              <div className="col-span-1 flex flex-col">
                <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
                  <div className="flex">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">Recommended Followers Graph</span>

                      <div className="flex gap-1 items-center">
                        <Sociogram data={graphData} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 grid grid-cols-1 gap-10">
              <div className="col-span-1 flex flex-col">
                <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
                  <div className="flex gap-x-10">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">Attest for sharing permit!</span>

                      <div className="flex gap-1 items-center">
                        <button
                          className="btn btn-secondary btn-md"
                          disabled={isLoading}
                          onClick={handleCreateAttestation}
                        >
                          {isLoading && <span className="loading loading-spinner loading-xs"></span>}
                          Attest Analytics
                        </button>
                      </div>
                      {attestationId ? <div>Attestation Id: {attestationId}</div> : null}
                    </div>
                    {/* <div className="flex flex-col gap-1">
                      <span className="font-bold">Share your analytics!</span>

                      <div className="flex gap-1 items-center">
                        <button className="btn btn-secondary btn-md" disabled={aloading} onClick={handleShareAnalytics}>
                          {aloading && <span className="loading loading-spinner loading-xs"></span>}
                          Send Analytics
                        </button>
                      </div>
                      {analyticsTx ? <div>Tx: {analyticsTx}</div> : null}
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-1 grid grid-cols-1 gap-10">
              <div className="col-span-1 flex flex-col">
                <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
                  <div className="flex gap-x-10">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold">Get Recommended Followers!</span>

                      <div className="flex gap-1 items-center">
                        <button
                          className="btn btn-secondary btn-md"
                          // disabled={String(attestationId) != "" || isLoading}
                          onClick={() => handleGetRecommendations(0)}
                        >
                          {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                          Gaming
                        </button>
                        <button
                          className="btn btn-secondary btn-md"
                          // disabled={String(attestationId) != "" || isLoading}
                          onClick={() => handleGetRecommendations(1)}
                        >
                          {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                          Web3 Social
                        </button>
                        <button
                          className="btn btn-secondary btn-md"
                          // disabled={String(attestationId) != "" || isLoading}
                          onClick={() => handleGetRecommendations(2)}
                        >
                          {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                          NFT Marketplace
                        </button>
                      </div>
                      <div className="flex gap-1 items-center">
                        <button
                          className="btn btn-secondary btn-md"
                          // disabled={String(attestationId) != "" || isLoading}
                          onClick={() => handleGetRecommendations(3)}
                        >
                          {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                          Dex Traders
                        </button>

                        <button
                          className="btn btn-secondary btn-md"
                          // disabled={String(attestationId) != "" || isLoading}
                          onClick={() => handleGetRecommendations(4)}
                        >
                          {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                          Similar Identity and certificates
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          {/* <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Home;
