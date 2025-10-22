// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {Savfe} from "../src/newContracts/Savfe.sol";
import {RotatingSavingsGroupFactory} from "../src/RotatingSavingsGroupFactory.sol";

contract DeploySavfeScript is Script {
    function setUp() public {}

    function run() public returns (Savfe, RotatingSavingsGroupFactory) {
        vm.startBroadcast();

        address stableCoinAddress = 0x036cbD53842C5426634e7929541Ec231bcE1BdAE; // Base Sepolia USDC address

        Savfe savfe = new Savfe(stableCoinAddress);
        RotatingSavingsGroupFactory rotatingSavingsGroupFactory = new RotatingSavingsGroupFactory(address(savfe));

        vm.stopBroadcast();

        return (savfe, rotatingSavingsGroupFactory);
    }
}
