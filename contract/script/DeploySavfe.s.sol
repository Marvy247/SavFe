// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {Savfe} from "../src/newContracts/Savfe.sol";
import {RotatingSavingsGroupFactory} from "../src/RotatingSavingsGroupFactory.sol";

contract DeploySavfeScript is Script {
    function setUp() public {}

    function run() public returns (Savfe, RotatingSavingsGroupFactory) {
        vm.startBroadcast();

        address stableCoinAddress = 0x0E82fDDAd51cc3ac12b69761C45bBCB9A2Bf3C83; // Lisk sepolia USDC address on L2

        Savfe savfe = new Savfe(stableCoinAddress);
        RotatingSavingsGroupFactory rotatingSavingsGroupFactory = new RotatingSavingsGroupFactory();

        vm.stopBroadcast();

        return (savfe, rotatingSavingsGroupFactory);
    }
}
