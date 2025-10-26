# Deployment and Frontend Update Plan

## Information Gathered
- Project uses Foundry for smart contract deployment.
- foundry.toml configured with base_sepolia RPC: https://sepolia.base.org
- Deployment script: contract/script/DeploySavfe.s.sol deploys Savfe and RotatingSavingsGroupFactory contracts.
- Frontend contract addresses are hardcoded in frontend/lib/contract.ts (FACTORY_ADDRESS, SAVFE_ADDRESS, NFT_ADDRESS).
- Previous deployments exist in contract/broadcast/ for chains 4202 and 84532 (Base Sepolia).

## Plan
1. Set the provided private key as an environment variable.
2. Deploy contracts to Base Sepolia using Foundry script.
3. Extract deployed contract addresses from broadcast output.
4. Update frontend/lib/contract.ts with new addresses for FACTORY_ADDRESS and SAVFE_ADDRESS.
5. Note: NFT_ADDRESS is not deployed in the script; assume it's pre-deployed or handle separately if needed.

## Dependent Files to Edit
- frontend/lib/contract.ts: Update FACTORY_ADDRESS and SAVFE_ADDRESS.

## Followup Steps
- Verify deployment success.
- Test frontend with new addresses.
- If NFT contract needs deployment, handle separately.
