# SavFe - Smarter and Secure Protocol

A decentralized application for rotating savings groups built on Base Sepolia testnet.

## Features

- **Create Groups**: Create new rotating savings groups with custom contribution amounts and periods
- **Join Groups**: Browse and join existing groups
- **Group Explorer**: View detailed information about specific groups
- **Groups Table**: View all available groups in a comprehensive table format
- **Contribute**: Make contributions to groups you're a member of
- **Withdraw Earnings**: Withdraw your accumulated earnings from the protocol

## New Features

### Groups Table

The application now includes a comprehensive table view of all available groups:

- **Toggle View**: Switch between single group explorer and all groups table
- **Real-time Data**: Loads group data directly from the blockchain
- **Batch Loading**: Efficiently loads groups in batches to avoid overwhelming the network
- **Join Groups**: Join groups directly from the table view
- **Group Details**: View creator, member count, contribution amounts, periods, and current status
- **Refresh**: Manually refresh the groups data

## Components

- `GroupsTable`: Displays all available groups in a table format
- `GroupExplorer`: Shows detailed information about a specific group
- `CreateGroup`: Form to create new groups
- `JoinGroup`: Interface to join existing groups
- `EarningsDisplay`: Shows user's earnings from the protocol
- `WithdrawEarnings`: Allows users to withdraw their earnings

## Technical Implementation

The GroupsTable component:

- Uses the `groupCounter` function to determine the total number of groups
- Loads group data in batches using the `readGroupData` utility function
- Implements proper error handling and loading states
- Provides real-time blockchain data reading using viem public client
- Supports joining groups directly from the table interface

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   NEXT_PUBLIC_FACTORY_ADDRESS=your_contract_address
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Smart Contract Integration

The application integrates with the RotatingSavingsGroupFactory smart contract:

- Reads group data using the `getGroup` function
- Gets total group count using `groupCounter`
- Allows joining groups with `joinGroup`
- Supports contributions with `contribute`
- Enables earnings withdrawal with `withdrawEarnings`
