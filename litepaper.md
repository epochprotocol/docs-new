# 📄 Litepaper

## Abstract

Epoch is an Intent-Solver Coordination layer that aims to empower the intent-centric abstraction of Web3. It is designed to leverage the declarative intents paradigm to build an infrastructure layer that can abstract away the complexities of chain interactions. The protocol's vision is to create a system where users can express their desired state outcome without needing to understand the underlying mechanisms of chains, protocols, gas fees, or execution paths and protocol through careful coordination, get users there through the best rates and routes.

Epoch is not just a means for solver coordination, but rather an overseer, a controller. Instead of friendly solver coordination, It focuses on optimizing what the user asked for.

Epoch is positioned between users, protocols, and chains to disburden dapps and users from constrictive execution environments and static execution flows. This opens the door for the conception of novel Web3 applications that will be free from these shortcomings.&#x20;

Epoch's "Sub-Intent orchestrators" first deconstruct users' intent into sub-intents, then coordinate and reconcile the competing solver market and users' state constraints. This makes Epoch distinctly unique in a way that it can solve for a multifaceted and comprehensive set of intent(s) rather than being limited to a class of predetermined or application-tailored intents.

## Complexity and Fragmentation in Web3 <a href="#heading-the-problem-of-complexity-and-fragmentation-in-web3" id="heading-the-problem-of-complexity-and-fragmentation-in-web3"></a>

The advent of Rollups and multichain-verse has exponentially increased the complexity of achieving desired on-chain states -&#x20;

* **Users** face significant challenges in navigating numerous dApps, protocols, and chains to make transactions, managing assets dispersed across various chains/rollups, and dealing with different gas token requirements to name a few.
* Constrictive execution environments restrict the creativity of **dApp builders** and internalizing protocols result in static execution paths which don't always provide the most optimal solution for the user.

Moreover, certain user intentions extend beyond simple, instantaneous execution, requiring persistent preferences for recurring actions and time-dependent or arbitrary condition-dependent constraints.

This complexity not only results in a bad user experience but also is a significant barrier to the mass adoption of Web3 and the development of user-centric applications.

## Solution

Epoch is a network of composable and modular **Intent Solvers,** **Sub-Intent Orchestrators(SIO),** and **Epoch Hyperions(Observers)** that compete and coordinate to achieve the most optimal solution for arbitrary user intents. &#x20;

Epoch facilitates counterparty discovery for solvers, and protocols and efficient solving processes by placing Sub-Intent Orchestrators at the helm of solution discovery, alongside other actors such as Hyperions and Intent Solvers.

### - Intent Input, Sub-Intent Orchestration, Solving, and Settlement

**Intent Input** - Users or dApps can use the declarative paradigm to provide their intents to the network for resolution.&#x20;

The intent could have the following attributes -&#x20;

* Approvals
* Task
* Optimization Factor
* Constraints
* Deadline
* Triggers
* Proposed Fee Rewards
* List of Preferred Solvers

**Sub-Intent Orchestration and Solving**

SIOs approach the intents by -&#x20;

* Deconstructing intents based on the desired end-state for possible state flows.
* Communicating with **Hyperions** for on-chain and off-chain states and conditions.
* Propagating sub-intent to the internal and external solvers for the most optimal partial state update solution.
* SIO gets all possible solutions for every sub-intent.
* SIOs also solve constraint optimization problems where the possible state flow solutions are then weighted as per the users' optimization factor and intent constraints maximizing the user output.
* Individual solvers are asked to fulfill their partial state update, all of which are then settled atomically regardless of the execution environment.

**Settlement**

To commit and validate state updates in the execution environments and hold user assets, preferences, and continuing permissions, Epoch uses smart contract wallets with Epoch Plugins and Hooks.

Epoch leverages multiple EIP/ERC standards like ERC-4337, EIP-7702, ERC-7579, ERC-7715, and others to manage wallets.

### - Architectural Topology

### Epoch Node

The node is divided into different environments

#### **Execution Client**

* Execution client maintains two mempools for intents and transactions.
* It also maintains an alternate mempool for transactions and intents that are supposed to be executed when a better on-chain/off-chain condition is found.
* It propagates intents and transactions across all the nodes through the P2P gossip layer.
* This also executes the final transaction on the settlement layer after receiving the intent solution from SIO.
* All the execution is done through an ERC4337 compliant transaction bundling.

**Context Setter**

* The context setter breaks down the intent into two pieces - the intent and execution condition.
* It analyses the user requirements, context, and triggers.
* It conveys the trigger condition to the Hyperions and other transaction-related context to the Solver environment.

**Epoch Hyperions(Observers)**

* The hyperions on each block, analyzes the chain state then observers if the user’s conditions are met, and ultimately marks the transaction or the intent to be ready to be sent.
* The observer environment has pluggable observers and the Intent can specify a specific class of observer specialised in some niche of Web3.&#x20;
* There is an inherent storage which can be utilised for consequent calculations or analysis.

**Solver Environment**

* **Sub-Intent Orchestrator (SIO)** and purpose specific **Intent Solvers Modules**
* SIOs can connect to several modules inside this environment and derive the order in which each module should be called.
* A single module finds the best route for a single action ("Stake", "Lend", "Swap" etc).
* Multiple modules are used in the solver environment, through their individual optimised partial state update solutions an aggregated state flow solution is dervied. &#x20;
* This aggregated solution is then sent to the consensus layer.

1. **Sub-Intent Orchestrator (SIO)**

* SIO is the key piece for solver coordination, it acts as the governing body for solver collaboration.
* SIO anaylzes the intent and looks at the desired end state.
* Through it's own composable logic, SIO can deconstruct the intent into sub-intents.&#x20;
* For every individual sub-intent, It queries internal and external Intent Solvers and weighs all the possible partial state update solutions.&#x20;
* SIO connects the initial and end state with the most optimal partial state transition solution.&#x20;
* Node runner can tweak SIO if they want or use their own business logic for obtaining sub-intents.

<figure><img src=".gitbook/assets/Epoch Flows Dark Mode (5).png" alt=""><figcaption><p>SIO Flow</p></figcaption></figure>

2. **Intent Modules**

* Intent Modules contains the business logic and optimsation model for a particular task a node is willing to solve for ("Stake", "Lend", "Swap" etc).
* This logic can be plugging in multiple Intent Solvers, Adapter, using AI-based models, AI-generated Intent Solvers, 3rd party plugins/services, etc.
* Node runners can pick which modules they want to plug in and utilise.&#x20;

**Consensus**

* All the interested node operators, using SIOs would propose their solution to the consensus.
* All the solutions are simulated, the one that achieves the desired final state in most optimal way is picked, all the necessary calculations, state validity, and decisions are verified, and then it is sent for final settlement.
* A ZK proof for the on-chain verifiability of the calculations, used for reward and liquidity dispersal.&#x20;

<figure><img src=".gitbook/assets/Epoch Flows Dark Mode (7).png" alt=""><figcaption><p>Epoch Node</p></figcaption></figure>

### On-chain Contracts

Epoch Protocol utilizes various contracts on the execution environments like chains to provide more on-chain verifiability.

**Registry and Gatekeeper**

* This contract acts as a registry and verifies all conditions and proofs that can be verified on-chain.
* Transaction data is added to this with a multi-send call when the transaction is being executed, it allows us to easily verify transaction conditions and maintain on-chain records without sending in multiple transactions for the same intent.
* This contract is a source of truth for hooks and plugins (discussed below).
* This contract also acts as an information store, it provides transactions and intents that are supposed to be executed in the future with more context.

**SAFE | Smart Contract Wallets**

* This is a standard smart contract wallet with support for Plugins and Hooks.
* It maintains custody of the user funds, assets and privileges.&#x20;
* The user or owner(in the case of multisig) are the only signers, Epoch does not hold any signing keys.
* It facilitates execution and automation of transactions without users giving custody of funds to protocol or intent solvers.
* Once EIP-7702 goes live users can hold funds in their EOA and still be able to leverage Epoch Features.

**Epoch Plugin**

* Epoch Plugin is an extension of Smart Wallet for Intent Settlement and Validity.&#x20;
* This plugin links the Intent Solution with Epoch Registry and GateKeeper contracts to enable transaction execution.
* It prepares a complete transaction and sends it to the smart wallet for final execution.

**Epoch Hook**

* This contract verifies the execution conditions, Two different checks can be made, pre-transaction and post-transaction.
* The hook contract gets information from the Registry and Gatekeeper contract and then verifies if all the state constraints are being met.
* This provides additional on-chain security and verification.

**Epoch Paymaster**

* Paymaster helps with paying gas fees on different networks.
* Users will not have to worry about having the right gas token on the final settlement layer and can be paid through other chains as well.&#x20;

**Epoch Liquidity Pools**

* Permissioned pools that maintain working liquidity for the protocol.&#x20;
* It is used as an alternative to bridging assets to give a near instantaneous experience to user.&#x20;
* Transaction will be executed on the destination chain first, while user assets on the source chain will be held in escrow. Proof of transaction execution will be communicated through our partners from the destination chain to the source chain and then assets from escrow can be added back to the liquidity pool.
* There is one pool on each chain and liquidity will be balanced constantly by our partner projects.
* Using the pools will incur a minimal fees, which will be distributed to liqudity providers and network participants.

<figure><img src=".gitbook/assets/Epoch Flows Dark Mode (8).png" alt=""><figcaption><p>Epoch On-Chain Contracts</p></figcaption></figure>

### Epoch SDK

* Epoch SDK is the primary component that dapp developers interact with to easily construct and send signed intents.
* It helps in cutting down development time from days to hours.
* It also helps in setting the right constraints for users' intents and transactions.
* It adds all the necessary calls to the userOp that will aid in on-chain verification, by Epoch Registry and GateKeeper Contract.
* It also allows developers to prepare userOp and transaction data to automate non-intent-based transactions.

All these moving components work together in stitching a solution that allows users and protocols to provide an unparalleled experience even for some Web2 flows.

It also reduces efforts to build dApps by offloading extra work to Epoch Protocol.

## Use cases

**dApps**

1. DApps can be part of Epoch’s Intent solver repository and be part of various proposed solutions.
2. DApps can get the user in the right state for using their dApp, with just one click, something like getting the right tokens or positions, by using Epoch Protocol.
3. Craft various strategies for investing tokens or earning APRs.
4. DApps that need users to bridge assets from another network or swap tokens can simply use epoch to get all the right transactions in place, with the most optimal rates and everything instantly and atomically including bridging.

**Users**

1. Users can lend and stake based on changing on-chain conditions and APRs.
2. Users will not have to care about their fragmented liquidity, they will be able to make transactions involving any tokens available on any chain.
3. Instantaneous bridging of assets
4. Users will be able to tell their requirements in natural language.

## Conclusion

Epoch Protocol, leveraging the new declarative intent-centric interaction paradigm, would be a game changer for both dApps and users.  Everchanging multichain web3-verse with fragmented liquidity, complicated multi-steped actions to reach to a specific state, and difficult-to-understand transactions becomes a major cognitive hurdle for users to leverage web3.&#x20;

Epoch Protocol will not only optimize for the desired user state but also observe for better conditions, explore all chains for options and finally give the most optimal solution. It will help users deal with all the complexities that come with interacting with web3.

With Epoch, dApps would be able to build solutions that were not possible before, UX flows that rivals or even better than web2 UX.
