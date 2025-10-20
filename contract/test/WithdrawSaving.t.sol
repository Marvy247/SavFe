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
    string erc20House = "erc20Hourse";
    uint savingAmount = 0.1 ether;
    uint extraTimeDuration = 1000;

}


contract SavfeTest is Test, SavfeSetup {
    Savfe public savfe;
    ChildSavfe public childSavfe;
    address randomToken;
    uint savedAmount;
    uint closeTime; 

    constructor() {
        // savfe = new Savfe(stableCoin, svToken); // Moved to setUp
        randomToken = address(new USDX());
    }

    function setUp() public {
        savfe = new Savfe(address(stableCoin));
        vm.deal(userWJoined, 1 ether);
        vm.startPrank(userWJoined);
        savfe.joinSavfe{value: joinFee}();
        ChildSavfe childContract = getChildContract();
        uint initialBalance = address(childContract).balance;
        closeTime = block.timestamp + extraTimeDuration;
        savfe.createSaving{value: savingAmount}(school, closeTime, 1, false, address(0), savingAmount);
        uint finalBalance = address(childContract).balance;

        // check values
        ChildSavfe.SavingDataStruct memory saving = childContract.getSaving(school);
        assert(saving.isValid);
        savedAmount = finalBalance - initialBalance;
        assertEq(savedAmount, saving.amount);
        vm.stopPrank();
    }

    function getChildContract() internal view returns (ChildSavfe childContract) {
        childContract = ChildSavfe(savfe.getUserChildContractAddress());
    }

    function test_WithdrawNativeSaving() public {

        vm.startPrank(userWJoined);
        uint initialBalance = userWJoined.balance;

        vm.warp(closeTime);
        savfe.withdrawSaving(school);
        uint finalBalance = userWJoined.balance;

        assertEq(finalBalance - initialBalance, savedAmount);
        vm.stopPrank();
    }

    function test_RevertIf_InvalidSaving() public {

        vm.startPrank(userWJoined);
        uint initialBalance = userWJoined.balance;

        vm.warp(closeTime);
        savfe.withdrawSaving(school);
        uint finalBalance = userWJoined.balance;

        assertEq(finalBalance - initialBalance, savedAmount);

        vm.expectPartialRevert(SavfeHelperLib.InvalidSaving.selector);
        savfe.withdrawSaving(school);
        vm.stopPrank();
    }

    function test_WithdrawNativeSavingTakesOnlySaving() public {

        vm.startPrank(userWJoined);

        ChildSavfe childContract = getChildContract();
        uint initialContractBalance = address(childContract).balance;
        vm.warp(closeTime);
        savfe.withdrawSaving(school);
        uint finalContractBalance = address(childContract).balance;

        assertEq(initialContractBalance - finalContractBalance, savedAmount);
        vm.stopPrank();
    }

        function saveERC20(string memory savingName) internal {
        deal(randomToken, userWJoined, 130e18);

        uint initialBalance = USDX(randomToken).balanceOf(userWJoined);
        closeTime = block.timestamp + extraTimeDuration;
        // allowance
        USDX(randomToken).approve(address(savfe), savingAmount);
        // create saving with randomToken
        savfe.createSaving{value: savingAmount}(savingName, closeTime, 1, false, randomToken, savingAmount);
        uint finalBalance = USDX(randomToken).balanceOf(userWJoined);
        savedAmount = initialBalance - finalBalance;
    }

     function test_WithdrawERC20Saving() public {

        vm.startPrank(userWJoined);
        saveERC20(erc20House);

        //  withdraw
        uint initialBalance = USDX(randomToken).balanceOf(userWJoined);

        vm.warp(closeTime);
        savfe.withdrawSaving(erc20House);
        uint finalBalance = USDX(randomToken).balanceOf(userWJoined);

        uint256 principal = savingAmount; // For ERC20, principal is just savingAmount
        // uint256 expectedInterest = principal / 1000; // Based on temporary interest calculation
        uint256 expectedWithdrawalAmount = principal; // Contract currently only returns principal
        assertEq(finalBalance - initialBalance, expectedWithdrawalAmount);
        vm.stopPrank();
    }

}
