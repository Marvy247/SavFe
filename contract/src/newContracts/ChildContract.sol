// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SavfeHelperLib.sol";
import "./Savfe.sol";

contract ChildSavfe {
    // *** Contract parameters ***
    address payable public SavfeAddress;
    IERC20 public stableCoin;
    address public ownerAddress;

    // *** Contract Storage ***
    // structure of saving data
    struct SavingDataStruct {
        bool isValid;
        uint256 amount;
        address tokenId;
        uint256 startTime;
        uint256 penaltyPercentage;
        uint256 maturityTime;
        bool isSafeMode;
    }

    // mapping of name of saving to individual saving
    mapping(string => SavingDataStruct) public savings;

    struct SavingsNamesObj {
        string[] savingsNames;
    }

    SavingsNamesObj private savingsNamesVar;

    constructor(address _ownerAddress, address _stableCoin) payable {
        // save SavfeAddress first // todo: retrieve correct address
        SavfeAddress = payable(msg.sender);
        // store owner's address
        ownerAddress = payable(_ownerAddress);
        // store stable coin
        stableCoin = IERC20(payable(_stableCoin));
    }

    modifier SavfeOnly() {
        if (msg.sender != SavfeAddress) {
            revert SavfeHelperLib.CallNotFromSavfe();
        }
        _;
    }

    function addSavingName(string memory _name) private {
        savingsNamesVar.savingsNames.push(_name);
    }

    // Contract Getters
    function getSavingMode(string memory nameOfSaving) external view returns (bool) {
        return savings[nameOfSaving].isSafeMode;
    }

    function getSavingTokenId(string memory nameOfSaving) external view returns (address) {
        return savings[nameOfSaving].tokenId;
    }

    function getSavingsNames() external view returns (SavingsNamesObj memory) {
        return savingsNamesVar;
    }

    function getSaving(string memory nameOfSaving) public view returns (SavingDataStruct memory) {
        return savings[nameOfSaving];
    }

    // functionality to create savings
    function createSaving(
        string memory name,
        uint256 maturityTime,
        uint256 startTime,
        uint8 penaltyPercentage,
        address tokenId,
        uint256 amountToRetrieve,
        bool isSafeMode
    ) public payable SavfeOnly returns (uint256) {
        // ensure saving does not exist; !
        if (savings[name].isValid) revert SavfeHelperLib.InvalidSaving();
        // check if end time valid
        if (maturityTime < startTime) revert SavfeHelperLib.InvalidTime();
        if (maturityTime < block.timestamp) revert SavfeHelperLib.InvalidTime();

        uint256 savingsAmount = amountToRetrieve;

        if (isSafeMode) {
            SavfeHelperLib.retrieveToken(SavfeAddress, address(stableCoin), amountToRetrieve);
        } else {
            if (tokenId != address(0)) {
                // For ERC20, transfer directly from user to child contract
                require(IERC20(tokenId).transferFrom(ownerAddress, address(this), amountToRetrieve), "ERC20 transfer failed");
            } else {
                // case native token
                savingsAmount = msg.value;
            }
        }

        // store saving to map of savings
        SavingDataStruct storage newSaving = savings[name];
        newSaving.amount = savingsAmount;
        newSaving.maturityTime = maturityTime;
        newSaving.startTime = startTime;
        newSaving.tokenId = tokenId;
        newSaving.penaltyPercentage = penaltyPercentage;
        newSaving.isSafeMode = isSafeMode;
        newSaving.isValid = true;

        // addSavingName(name);
        addSavingName(name);

        emit SavfeHelperLib.SavingCreated(name, amountToRetrieve, tokenId);

        return 1;
    }

    // functionality to add to savings
    function incrementSaving(
        string memory name,
        uint256 savingPlusAmount,
        uint256 childContractGasFee
    ) public payable SavfeOnly returns (uint256) {
        // fetch savings data
        SavingDataStruct storage toFundSavings = savings[name];
        if (!toFundSavings.isValid) revert SavfeHelperLib.InvalidSaving();
        if (block.timestamp > toFundSavings.maturityTime) revert SavfeHelperLib.InvalidTime();

        bool isNativeToken = toFundSavings.tokenId == address(0);

        // handle retrieving token from contract
        if (toFundSavings.isSafeMode) {
            SavfeHelperLib.retrieveToken(SavfeAddress, address(stableCoin), savingPlusAmount);
        } else {
            if (!isNativeToken) {
                // For ERC20, transfer directly from user to child contract
                require(IERC20(toFundSavings.tokenId).transferFrom(ownerAddress, address(this), savingPlusAmount), "ERC20 transfer failed");
            } else {
                require(msg.value >= savingPlusAmount + childContractGasFee, SavfeHelperLib.InvalidIncrementValue());
                savingPlusAmount = msg.value;
            }
        }

        toFundSavings.amount = toFundSavings.amount + savingPlusAmount;

        // save new savings data
        savings[name] = toFundSavings;

        emit SavfeHelperLib.SavingIncremented(name, savingPlusAmount, toFundSavings.amount, toFundSavings.tokenId);

        return toFundSavings.amount;
    }

    function withdrawSaving(string memory name) public payable SavfeOnly returns (string memory) {
        SavingDataStruct storage toWithdrawSavings = savings[name];
        // check if saving exit
        if (!toWithdrawSavings.isValid) revert SavfeHelperLib.InvalidSaving();
        uint256 amountToWithdraw = toWithdrawSavings.amount;
        Savfe savfe = Savfe(SavfeAddress);
        // check if saving is mature
        if (block.timestamp < toWithdrawSavings.maturityTime) {
            // remove penalty from savings
            amountToWithdraw = (toWithdrawSavings.amount * (100 - toWithdrawSavings.penaltyPercentage)) / 100;
        }

        // send the savings amount to withdraw
        address tokenId = toWithdrawSavings.tokenId;
        // function can be abstracted for sending token out
        bool isDelivered = false;
        if (toWithdrawSavings.isSafeMode) {
            // approve withdrawal from parent contract
            SavfeHelperLib.approveAmount(SavfeAddress, amountToWithdraw, address(stableCoin));
            // call parent for conversion
            isDelivered = savfe.sendAsOriginalToken(tokenId, amountToWithdraw, ownerAddress);
        } else {
            if (tokenId == address(0)) {
                                (bool sent, ) = ownerAddress.call{value: amountToWithdraw}("");
                require(sent, SavfeHelperLib.FundsTransferFailed());
                isDelivered = sent;
            } else {
                isDelivered = SavfeHelperLib.transferToken(toWithdrawSavings.tokenId, ownerAddress, amountToWithdraw);
            }
        }
        // Delete savings; ensure saving is deleted/made invalid
        if (isDelivered) {
            savings[name].isValid = false;

            emit SavfeHelperLib.SavingWithdrawn(name);

            return "savings withdrawn successfully";
        }

        revert();
    }
}
