"use client";

import { particleWagmiWallet } from "@/particleWallet/particleWagmiWallet";
import {
  AuthCoreEvent,
  getLatestAuthType,
  isSocialAuthType,
  particleAuth,
  type SocialAuthType,
} from "@particle-network/auth-core";
import {
  useConnect as useParticleConnect,
  useEthereum,
} from "@particle-network/auth-core-modal";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { use, useEffect } from "react";
import {
  useConnect,
  useDisconnect,
  useSignMessage,
  useConnectorClient,
  useWalletClient,
  useWriteContract,
  useConfig,
} from "wagmi";
import styles from "./page.module.css";
import { ichichainFakeUsdtContract } from "../src/contract/abi";
import {
  AAWrapProvider,
  SendTransactionMode,
  SmartAccount,
} from "@particle-network/aa";
import { BNBChainTestnet } from "@particle-network/chains";
import { createWalletClient, custom, parseEther } from "viem";
import { bscTestnet } from "viem/chains";
import { sendTransaction } from "@wagmi/core";

export default function Home() {
  // start: fix social auth login
  const { connect } = useConnect();
  const { connectionStatus } = useParticleConnect();
  const { disconnect } = useDisconnect();
  const { provider } = useEthereum();

  const smartAccount = new SmartAccount(provider, {
    projectId: "34c6b829-5b89-44e8-90a9-6d982787b9c9",
    clientKey: "c6Z44Ml4TQeNhctvwYgdSv6DBzfjf6t6CB0JDscR",
    appId: "ded98dfe-71f9-4af7-846d-5d8c714d63b0",
    aaOptions: {
      accountContracts: {
        biconomy: [{ chainIds: [BNBChainTestnet.id], version: "2.0.0" }],
      },
      paymasterApiKeys: [
        {
          chainId: BNBChainTestnet.id,
          apiKey: "IDZXku3zK.133c8313-2298-4c76-bdb1-7080413f3d22",
        },
      ],
    },
  });

  // use walletClient to sendTransaction, signMessage by wagmi core

  const handleSendTransaction = async () => {
    try {
      const address = await smartAccount.getAddress();

      const AAClient = createWalletClient({
        account: address as `0x${string}`,
        chain: bscTestnet,
        transport: custom(
          new AAWrapProvider(smartAccount, SendTransactionMode.Gasless)
        ),
      });

      const smartAccountAddress = await smartAccount.getAddress();

      const request = await AAClient.prepareTransactionRequest({
        account: smartAccountAddress as `0x${string}`,
        to: "0x70997970c51812dc3a010c7d01b50e0d17dc79c8" as `0x${string}`,
        value: parseEther("0.002"),
      });

      const signature = await AAClient.signTransaction(request);

      console.log("Transaction successful:", signature);
      // Optionally process result here
    } catch (err) {
      console.error("Transaction failed:", err);
    }
  };

  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      isSocialAuthType(getLatestAuthType())
    ) {
      connect({
        connector: particleWagmiWallet({
          socialType: getLatestAuthType() as SocialAuthType,
        }),
      });
    }
    const onDisconnect = () => {
      disconnect();
    };
    particleAuth.on(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
    return () => {
      particleAuth.off(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
    };
  }, [connect, connectionStatus, disconnect]);
  // end: fix social auth login

  return (
    <main className={styles.main}>
      <ConnectButton></ConnectButton>
      <button onClick={handleSendTransaction}>Transfer</button>
    </main>
  );
}
