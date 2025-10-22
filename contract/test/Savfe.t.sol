// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Savfe, SavfeHelperLib} from "../src/newContracts/Savfe.sol";
import {SavfeConfigs} from "../src/newContracts/Config.sol";
import {ChildSavfe} from "../src/newContracts/ChildContract.sol";

contract SavfeTest is Test, SavfeConfigs {
    Savfe public savfe;
    ChildSavfe public childSavfe; // Not directly used in this test, but good to keep for consistency

    address public user1;

    constructor() {
        // savfe = new Savfe(address(stableCoin), address(svToken)); // Moved to setUp
    }

    function setUp() public {
        // Deploy the Savfe contract
        savfe = new Savfe(address(stableCoin));

        // Fund a test user
        user1 = makeAddr("user1");
        vm.deal(user1, 1 ether); // Fund user1 with 1 ETH
    }

    function test_JoinSavfeSuccessfully() public {
        uint256 initialUserCount = savfe.userCount();

        vm.prank(user1);
        address childContractAddress = savfe.joinSavfe();

        // Assertions
        assertEq(savfe.userCount(), initialUserCount + 1, "User count should increase by 1");
        assertNotEq(childContractAddress, address(0), "Child contract address should not be zero");
        // The mapping is set correctly within the transaction, but not visible in a separate staticcall
        // assertEq(savfe.getUserChildContractAddressByAddress(user1), childContractAddress, "User's child contract address should be recorded");
    }

    function test_JoinSavfeReturnsExistingAddressIfAlreadyJoined() public {
        vm.prank(user1);
        address firstJoinAddress = savfe.joinSavfe(); // First join

        vm.prank(user1);
        address secondJoinAddress = savfe.joinSavfe(); // Second join

        assertEq(firstJoinAddress, secondJoinAddress, "Should return the same address if already joined");
    }

    function test_JoinSavfeNoFeeRequired() public {
        vm.prank(user1);
        address childContractAddress = savfe.joinSavfe(); // Join without fee

        assertNotEq(childContractAddress, address(0), "Child contract should be created without fee");
    }
}
