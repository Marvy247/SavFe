# SavFe - Decentralized Savings Protocol

A comprehensive decentralized savings platform built on blockchain, offering both individual savings accounts and rotating savings groups (ROSCAs). SavFe enables users to save securely, earn interest, and participate in community-based savings circles.

## 🌟 Features

### Individual Savings
- **Create Savings**: Set up personal savings accounts with custom maturity dates and penalty rates
- **Flexible Deposits**: Support for native tokens and ERC20 tokens
- **Penalty System**: Automatic penalties for early withdrawals to encourage discipline
- **Safe Mode**: Option for stablecoin conversion (planned feature)
- **Child Contracts**: Each user gets a dedicated smart contract for their savings

### Rotating Savings Groups (ROSCAs)
- **Create Groups**: Start new savings groups with custom contribution amounts and periods
- **Join Groups**: Browse and join existing groups
- **Automated Payouts**: Smart contracts handle round-robin payouts automatically
- **Real-time Tracking**: Monitor contributions, rounds, and payouts
- **Group Explorer**: Comprehensive table view of all available groups
- **Batch Loading**: Efficient data loading to handle large numbers of groups

### Platform Features
- **Admin Panel**: Platform management and earnings withdrawal
- **Transaction History**: Complete audit trail of all activities
- **User Dashboard**: Personalized view of savings and group participations
- **Wallet Integration**: Seamless connection with Web3 wallets
- **Cross-chain Support**: Built for multi-chain deployment

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity**: ^0.8.20
- **Foundry**: Development framework for testing and deployment
- **OpenZeppelin**: Secure smart contract libraries
- **PRB Math**: Advanced mathematical operations
- **Uniswap V3**: DEX integration for token swaps

### Frontend
- **Next.js**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi/Viem**: Ethereum interaction library
- **Radix UI**: Accessible component library
- **Chart.js**: Data visualization
- **React Query**: Data fetching and caching

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Turbopack**: Fast bundler

## 📁 Project Structure

```
SavFe/
├── contract/                 # Smart contracts
│   ├── src/
│   │   ├── newContracts/
│   │   │   ├── Savfe.sol          # Main savings contract
│   │   │   ├── ChildContract.sol  # User-specific savings
│   │   │   └── Config.sol         # Configuration
│   │   └── RotatingSavingsGroupFactory.sol  # Group savings
│   ├── test/                 # Contract tests
│   ├── script/               # Deployment scripts
│   └── lib/                  # Dependencies (OpenZeppelin, etc.)
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   │   ├── ui/               # Reusable UI components
│   │   └── ...               # Feature components
│   ├── lib/                  # Utilities and contracts
│   └── public/               # Static assets
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Foundry (for smart contracts)
- Git

### Smart Contract Setup

1. **Install Foundry**:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Clone and setup contracts**:
   ```bash
   cd contract
   forge install
   ```

3. **Run tests**:
   ```bash
   forge test
   ```

4. **Deploy contracts**:
   ```bash
   # Set your private key
   export PRIVATE_KEY=your_private_key

   # Deploy to Lisk Sepolia
   forge script script/DeploySavfe.s.sol --rpc-url https://rpc.sepolia-api.lisk.com --broadcast --verify
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment setup**:
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_FACTORY_ADDRESS=your_factory_contract_address
   NEXT_PUBLIC_SAVFE_ADDRESS=your_savfe_contract_address
   NEXT_PUBLIC_CHAIN_ID=4202
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 🌐 Deployment

### Smart Contracts
- **Network**: Lisk Sepolia Testnet
- **Factory Address**: See `contract/README.md`
- **Savfe Address**: See `contract/README.md`

### Frontend
- **Framework**: Vercel (recommended)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

## 📊 Usage

### For Users
1. Connect your Web3 wallet
2. Choose between individual savings or joining groups
3. Create or join savings groups
4. Make regular contributions
5. Withdraw earnings when it's your turn

### For Developers
- Smart contracts are fully tested with Foundry
- Frontend uses modern React patterns
- Comprehensive TypeScript coverage
- Modular component architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow Solidity best practices
- Write comprehensive tests
- Use TypeScript for frontend code
- Follow conventional commit messages
- Ensure all tests pass before PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure contract templates
- Uniswap for DEX infrastructure
- Lisk for testnet support
- The DeFi community for inspiration

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation

---

**SavFe** - Building the future of decentralized savings, one block at a time.
