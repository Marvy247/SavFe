# PiggySavfe: The Future of Social Savings, Built on Base

**SavFe makes saving money simple, social, and rewarding by turning it into a game. We leverage the power of Base to provide a user experience so seamless, you'll forget you're using crypto.**

---

### The Problem: Saving is Hard, Lonely, and Boring

For millions of people, saving money is a constant struggle. Traditional finance tools are uninspiring, and while crypto offers new possibilities, it remains too complex for the average person. The barriers are high: confusing seed phrases, unpredictable gas fees, and intimidating wallet addresses.

### The Solution: SavFe - Save Together, Win Together

SavFe is a decentralized social savings platform that transforms saving from a chore into a rewarding, community-driven experience. We combine the time-tested model of Rotating Savings and Credit Associations (ROSCAs) with modern gamification and AI, all powered by a frictionless, Base-native user experience.

### Key Innovations for a Billion Users

This isn't just another DeFi app. We've focused on solving the core problems of user onboarding and engagement to build a platform that's ready for mainstream adoption.

#### 1. Effortless Onboarding & Gasless Experience (Powered by Base)
*   **Email Login:** Forget seed phrases. Users can create a secure, self-custodial smart wallet with just their email address, powered by Base Account Abstraction.
*   **Gasless Transactions:** Thanks to Base's native Paymaster, users can join savings groups and make their first deposits without needing any ETH for gas. The barrier to entry is zero.
*   **Human-Readable Names:** No more `0x...` addresses. We use Basenames (`.base`) for profiles, invites, and sending funds, making the experience intuitive and social.

#### 2. Dynamic, Rewarding Gamification
*   **The Evolving NFT Passport:** Every user gets a dynamic, SVG-based NFT that acts as their savings passport. This NFT is not static; it visually evolves—changing colors, patterns, and tiers (from Bronze to Diamond)—as the user saves more and unlocks achievements.
*   **Meaningful Achievements:** Our achievement system tracks on-chain activity to reward users for positive financial habits, from consistent saving streaks to leading a savings group.

#### 3. AI-Powered, Onchain-Aware Guidance
*   **Smart Suggestions:** Our AI assistant provides contextual, onchain-aware suggestions. It will notify users when gas fees are low (the perfect time to contribute!), suggest a deposit after a recent payment, or recommend topping up their wallet to meet a goal.

#### 4. Social Savings (DeFi ROSCAs)
*   **Save with Friends:** Users can create or join rotating savings groups, leveraging community accountability to reach their financial goals faster.
*   ** Secure & Automated:** All contributions and payouts are managed transparently and securely by smart contracts, eliminating the need for a traditional intermediary.

### Architecture

SavFe's architecture is designed for seamless user experience, security, and scalability on the Base network:

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Next.js App   │  │   React Components│  │   Wagmi/Viem   │  │
│  │   (TypeScript)  │  │   (Tailwind CSS) │  │   Integration   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OnchainKit Integration                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Smart Wallets   │  │   Basenames     │  │   Paymasters    │  │
│  │ (Email Login)   │  │   (.base)       │  │   (Gasless TX)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Base Blockchain                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Savfe.sol     │  │ RotatingSavings│  │   ERC-20 Tokens  │  │
│  │   (Main Logic)  │  │ GroupFactory.sol│  │   (Stablecoins)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Key Components:**
- **Frontend Layer:** Next.js application with TypeScript for type safety and Tailwind CSS for responsive design
- **Integration Layer:** OnchainKit provides seamless wallet management, human-readable names, and gasless transactions
- **Smart Contract Layer:** Solidity contracts deployed on Base, handling savings logic, group management, and token interactions
- **Blockchain Layer:** Base network provides fast, low-cost transactions and L2 security

### Deployed Contracts

SavFe is deployed on both Base Sepolia (testnet) and Base (mainnet):

#### Base Sepolia (Testnet)
- **Savfe Contract:** `0x6516023ffbf905f4c5530cb7b1fb08d7ed080579`
- **RotatingSavingsGroupFactory:** `0x10b7af494cc98c059952bf8259dd80c3a936817a`

#### Base (Mainnet)
- **Savfe Contract:** `0x5b73c5498c1e3b4dba84de0f1833c4a029d90519`
- **RotatingSavingsGroupFactory:** `0x7fa9385be102ac3eac297483dd6233d62b3e1496`

### Tech Stack

*   **Smart Contracts:** Solidity, Foundry, OpenZeppelin
*   **Frontend:** Next.js, TypeScript, Tailwind CSS
*   **Blockchain Integration:**
    *   **Base:** The core infrastructure for our contracts and user experience.
    *   **OnchainKit (@coinbase/onchainkit):** For seamless integration of Smart Wallets, Basenames, and Paymasters.
    *   **Wagmi & Viem:** For robust and type-safe blockchain interaction.
*   **Development Tools:** ESLint, Prettier, GitHub Actions for CI/CD

### Getting Started

1.  **Clone the repo:** `git clone <repo-url>`
2.  **Install dependencies:**
    ```bash
    cd contract && forge install
    cd ../frontend && pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the frontend directory with:
    ```env
    NEXT_PUBLIC_BASE_RPC_URL=https://sepolia.base.org
    NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
    ```
4.  **Run the contracts (local development):**
    ```bash
    cd contract
    forge test
    forge script script/DeploySavfe.s.sol --rpc-url $BASE_SEPOLIA_RPC --private-key $PRIVATE_KEY --broadcast
    ```
5.  **Run the frontend:**
    ```bash
    cd frontend
    pnpm dev
    ```

### 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Running tests and linting
- Submitting pull requests
- Code style guidelines

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**PiggySavfe is more than a DApp; it's a blueprint for the future of accessible, onchain finance. By leveraging the best of Base, we're turning a powerful financial primitive into an experience that's ready for everyone.**
