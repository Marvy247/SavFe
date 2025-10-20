// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Savfe, SavfeHelperLib} from "../src/newContracts/Savfe.sol";
import {USDX} from "./USDX.sol";
import {ChildSavfe} from "../src/newContracts/ChildContract.sol";

abstract contract SavfeSetup {
    address stableCoin = address(0x05D032ac25d322df992303dCa074EE7392C117b9);
    address svToken = address(0x05D032ac25d322df992303dCa074EE7392C117b9);
    uint256 joinFee = 0.01 ether;

    // some users
    address userWJoined = address(1);
    address userNJoined = address(2);
    address userRandom = address(3);

    // struct saving data
    string school = "school";
    uint savingAmount = 0.1 ether;
    uint extraTimeDuration = 1000;

}


contract SavfeTest is Test, SavfeSetup {
    Savfe public savfe;
    ChildSavfe public childSavfe;
    address randomToken;

    constructor() {
        // savfe = new Savfe(stableCoin, svToken); // Moved to setUp
        randomToken = address(new USDX());
    }

    function setUp() public {
        savfe = new Savfe(address(stableCoin));
        vm.deal(userWJoined, 1 ether);
        vm.startPrank(userWJoined);
        savfe.joinSavfe{value: joinFee}();
        vm.stopPrank();
    }

    function getChildContract() internal view returns (ChildSavfe childContract) {
        childContract = ChildSavfe(savfe.getUserChildContractAddress());
    }

    function test_CreateSavingWithNative() public {
        vm.startPrank(userWJoined);
        ChildSavfe childContract = getChildContract();
        uint initialBalance = address(childContract).balance;
        uint closeTime = block.timestamp + extraTimeDuration;
        savfe.createSaving{value: savingAmount}(school, closeTime, 1, false, address(0), savingAmount);
        uint finalBalance = address(childContract).balance;

        // check values
        ChildSavfe.SavingDataStruct memory saving = childContract.getSaving(school);
        assert(saving.isValid);
        assertEq(finalBalance - initialBalance, saving.amount);
        vm.stopPrank();
    }

    function test_RevertIf_NoAllowance() public {
        vm.startPrank(userWJoined);
        deal(randomToken, userWJoined, 130e18);

        uint closeTime = block.timestamp + extraTimeDuration;
        // create saving with randomToken
        try savfe.createSaving{value: savingAmount}(school, closeTime, 1, false, randomToken, savingAmount) {
            fail("should have reverted");
        } catch (bytes memory reason) {
            assertEq(reason, abi.encodeWithSelector(SavfeHelperLib.TokenWithdrawalFailed.selector));
        }
        
        vm.stopPrank();
    }

    function test_CreateSavingWithERC20() public {
        vm.startPrank(userWJoined);
        deal(randomToken, userWJoined, 130e18);
        ChildSavfe childContract = getChildContract();

        uint initialBalance = USDX(randomToken).balanceOf(userWJoined);
        uint closeTime = block.timestamp + extraTimeDuration;
        // allowance
        USDX(randomToken).approve(address(savfe), savingAmount);
        // create saving with randomToken
        savfe.createSaving{value: savingAmount}(school, closeTime, 1, false, randomToken, savingAmount);
        uint finalBalance = USDX(randomToken).balanceOf(userWJoined);

        console.log(initialBalance);

        // check values
        ChildSavfe.SavingDataStruct memory saving = childContract.getSaving(school);
        assert(saving.isValid);
        assertEq(initialBalance - finalBalance, saving.amount);

        vm.stopPrank();
    }

    function test_RevertIf_InvalidSaving() public {
        vm.startPrank(userWJoined);
        deal(randomToken, userWJoined, 130e18);
        uint closeTime = block.timestamp + extraTimeDuration;

        // first saving
        savfe.createSaving{value: savingAmount}(school, closeTime, 1, false, address(0), savingAmount);

        // allowance
        USDX(randomToken).approve(address(savfe), savingAmount);
        // create saving with randomToken
        vm.expectPartialRevert(SavfeHelperLib.InvalidSaving.selector);
        savfe.createSaving{value: savingAmount}(school, closeTime, 1, false, randomToken, savingAmount);
        vm.stopPrank();
    }
}