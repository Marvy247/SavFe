# TODO: Implement Basename Fetching in DisplayName Component

## Steps to Complete
- [x] Modify `frontend/components/DisplayName.tsx` to use `useReadContract` from wagmi to fetch basename from the Basenames contract on Base mainnet (chainId: 8453).
- [x] Define the Basenames contract address and minimal ABI for the `getName` function.
- [x] Update the component logic to display the basename if available, otherwise fall back to truncated address.
- [x] Add Base mainnet to wagmi config to support cross-chain basename fetching.
- [ ] Test the component to ensure basename displays correctly for connected accounts with basenames.

## Notes
- Basenames contract address: 0x03c4738Ee98bE3447F61d9146524975282ecD2c17
- Function: getName(address) -> string
- Chain ID: 8453 (Base mainnet)
