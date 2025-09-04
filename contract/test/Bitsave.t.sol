// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Savfe, SavfeHelperLib} from "../src/newContracts/Savfe.sol";
import {SavfeConfigs} from "../src/newContracts/Config.sol";
import {ChildSavfe} from "../src/newContracts/ChildContract.sol";

contract SavfeTest is Test, SavfeConfigs {
    Savfe public savfe;
    ChildSavfe public childSavfe;

    constructor() {
        // savfe = new Savfe(address(stableCoin), address(svToken)); // Moved to setUp
    }

    function setUp() public {
        savfe = new Savfe(address(stableCoin));
    }

    function test_SetStableCoin() public view {
        assertEq(address(savfe.stableCoin()), address(stableCoin));
    }

    

    function test_SetMasterAddr() public view {
        assertEq(savfe.owner(), address(this));
    }

    function test_RevertIf_JoinWithLowFee() public {
       vm.expectPartialRevert(SavfeHelperLib.AmountNotEnough.selector);
       address newUser = address(1);
       vm.deal(newUser, 1 ether);
       vm.prank(newUser);
       savfe.joinSavfe{value: 0.000000001 ether}();
    }

}
