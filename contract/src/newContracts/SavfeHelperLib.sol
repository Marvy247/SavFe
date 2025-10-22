// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "forge-std/console.sol";

library SavfeHelperLib {

    // Constants
    uint256 public constant txnCharge = 0.02 ether;

    // Errors
    error NotEnoughToPayGasFee();
    error AmountNotEnough();
    error InvalidTime();
    error UserNotRegistered();
    error InvalidSaving();
    error CanNotWithdrawToken(string);
    error NotSupported(string);
    error MasterCallRequired();
    // child contract specific
    error CallNotFromSavfe();
    error InvalidSavingsAmount();
    error InvalidIncrementValue();
    error FundsTransferFailed();
    error TokenWithdrawalFailed();
    // Enhanced UX errors
    error InsufficientBalance(string details);
    error InvalidAddress(string context);
    error OperationNotAllowed(string reason);
    error ParameterOutOfRange(string param, string range);
    error ContractPaused(string message);

    // Events
    event JoinedSavfe(address indexed userAddress);
    event SavingCreated(string indexed nameOfSaving, uint256 amount, address token);
    event SavingIncremented(string indexed nameOfSaving, uint256 amountAdded, uint256 totalAmountNow, address token);
    event SavingWithdrawn(string indexed nameOfSaving);
    event TokenWithdrawal(address indexed from, address indexed to, uint256 amount);
    event Received(address indexed, uint256);

    function approveAmount(address toApproveUserAddress, uint256 amountToApprove, address targetToken)
        internal
        returns (bool)
    {
        IERC20 token = IERC20(targetToken);
        return token.approve(toApproveUserAddress, amountToApprove);
    }

    function retrieveToken(address toApproveUserAddress, address targetToken, uint256 amountToWithdraw)
        internal
        returns (bool)
    {
        // first request approval
        require(
            // approveAmount(toApproveUserAddress, amountToWithdraw, targetToken),
            IERC20(targetToken).allowance(toApproveUserAddress, address(this)) >= amountToWithdraw,
            SavfeHelperLib.TokenWithdrawalFailed()
        );
        return IERC20(targetToken).transferFrom(toApproveUserAddress, address(this), amountToWithdraw);
    }

    function transferToken(address token, address recipient, uint256 amount) internal returns (bool isDelivered) {
        IERC20 Token = IERC20(token);

        // convert address to Byte
        isDelivered = Token.transfer(recipient, amount);

        emit TokenWithdrawal(address(this), recipient, amount);
    }
}
