// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ChildContract.sol";
import "./SavfeHelperLib.sol";

contract Savfe {
    // *** Contract parameters ***
    IERC20 public stableCoin;
    address private _owner; // Renamed from masterAddress
    // *** Fountain ***
    uint256 public fountain;

    // *** Storage ***
    mapping(address => address) addressToUserBS;
    uint256 public userCount;

    // *** savings values ***
    // editing value from 0.0001 to 1wei
    uint256 public JoinLimitFee = 0.01 ether;
    uint256 public SavingFee = 0.0001 ether;
    uint256 public ChildContractGasFee = SavingFee / 20;

    constructor(address _stableCoin) payable {
        stableCoin = IERC20(_stableCoin);
        _owner = msg.sender;
        userCount = 0;
        fountain = msg.value;
    }

    modifier inhouseOnly() {
        if (msg.sender != _owner) {
            revert SavfeHelperLib.MasterCallRequired();
        }
        _;
    }

    modifier registeredOnly(address sender) {
        if (addressToUserBS[sender] == address(0)) {
            revert SavfeHelperLib.UserNotRegistered();
        }
        _;
    }

    modifier fromASavfeChildOnly(address childOwnerAddress) {
        address fetchedChildAddress = addressToUserBS[childOwnerAddress];
        if (
            fetchedChildAddress == address(0) // checks that the child contract exists
                    // could be merged into one check but for readability
                || fetchedChildAddress != msg.sender // and that the child contract sent the request
        ) {
            revert SavfeHelperLib.CallNotFromSavfe();
        }
        _;
    }

    function joinSavfe() public payable returns (address) {
        address ownerAddress = msg.sender;
        address currAddr = addressToUserBS[ownerAddress];
        if (currAddr != address(0)) {
            return currAddr;
        }
        if (msg.value < JoinLimitFee) {
            revert SavfeHelperLib.AmountNotEnough();
        }
        // deploy child contract for user
        address userBSAddress = address(new ChildSavfe(msg.sender, address(stableCoin)));
        addressToUserBS[ownerAddress] = userBSAddress;
        userCount += 1;
        emit SavfeHelperLib.JoinedSavfe(ownerAddress);
        return userBSAddress;
    }

    function getUserChildContractAddress() public view returns (address) {
        return addressToUserBS[msg.sender];
    }

    function getUserChildContractAddressByAddress(address _user) public view returns (address) {
        return addressToUserBS[_user];
    }

    function sendAsOriginalToken(address /*originalToken*/, uint256 amount, address ownerAddress)
        public
        payable
        fromASavfeChildOnly(ownerAddress)
        returns (bool)
    {
        // check amount sent
        // if (amount < poolFee) revert SavfeHelperLib.AmountNotEnough();
        // retrieve stable coin used from owner address
        return SavfeHelperLib.retrieveToken(msg.sender, address(stableCoin), amount);
        // convert to original token using crossChainSwap()
        // crossChainSwap(
        //     stableCoin,
        //     originalToken,
        //     amount,
        //     ownerAddress // send to owner address directly
        // );
    }

    /// Edit internal stablecoin data
    function editStableCoin(address _newStableCoin) public inhouseOnly {
        if (_newStableCoin != address(0)) {
            stableCoin = IERC20(_newStableCoin);
        }
    }

    /// Edit internal vault data
    function editFees(uint256 _joinFee, uint256 _savingFee) public inhouseOnly {
        if (_joinFee != 0) {
            JoinLimitFee = _joinFee;
        }
        if (_savingFee != 0) {
            SavingFee = _savingFee;
            ChildContractGasFee = _savingFee / 20;
        }
    }

    function dripFountain() public inhouseOnly {
        // send balance - fountain to masterAddress
        uint256 balance = address(this).balance;
        if (balance > fountain) {
            payable(_owner).transfer(balance - fountain);
        }
    }

    function transferOwnership(address newOwner) public inhouseOnly {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _owner = newOwner;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function handleNativeSaving(uint256 amount, address tokenToSave, address userChildContractAddress)
        private
        returns (uint256)
    {
        // check if native currency saving
        if (tokenToSave != address(0)) {
            // savingToken = tokenToSave;
            // amountToSave = amount;
            // perform withdrawal respective
            bool tokenHasBeenWithdrawn = SavfeHelperLib.retrieveToken(msg.sender, tokenToSave, amount);
            if (!tokenHasBeenWithdrawn) {
                revert SavfeHelperLib.CanNotWithdrawToken("Txn failed");
            }
            // let us know you've removed the savings
            emit SavfeHelperLib.TokenWithdrawal(msg.sender, address(this), amount);
            // approve child contract withdrawing token
            require(SavfeHelperLib.approveAmount(userChildContractAddress, amount, tokenToSave), SavfeHelperLib.InvalidSavingsAmount());
        } else {
            amount = msg.value - SavingFee;
        }
        return amount;
    }

    function createSaving(
        string memory nameOfSaving,
        uint256 maturityTime,
        uint8 penaltyPercentage,
        bool safeMode,
        address tokenToSave, // address 0 for native coin
        uint256 amount // discarded for native token; takes msg.value - SavingFee instead
    ) public payable registeredOnly(msg.sender) {
        if (msg.value < SavingFee) {
            revert SavfeHelperLib.NotEnoughToPayGasFee();
        }

        if (block.timestamp > maturityTime) {
            revert SavfeHelperLib.InvalidTime();
        }

        // NOTE: For now, no safeMode since no swap contract
        if (safeMode) {
            revert SavfeHelperLib.NotSupported("No safe mode yet!");
        }

        // user's child contract address
        address payable userChildContractAddress = getUserChildContractAddress(msg.sender);

        // Handle token sent
        uint256 amountRetrieved = handleNativeSaving(amount, tokenToSave, userChildContractAddress);

        // TODO:  perform conversion for stableCoin
        // functionality for safe mode
        // if (safeMode) {
        //     amountToSave = crossChainSwap(
        //         savingToken,
        //         stableCoin,
        //         amount,
        //         address(this)
        //     );
        //     savingToken = stableCoin;
        // }

        /// send savings request to child contract with a little gas
        // Initialize user's child contract
        ChildSavfe userChildContract = ChildSavfe(userChildContractAddress);

        userChildContract.createSaving{
            value: tokenToSave == address(0) ? ChildContractGasFee + amountRetrieved : ChildContractGasFee
        }(
            nameOfSaving,
            maturityTime,
            block.timestamp, // current time
            penaltyPercentage,
            tokenToSave,
            amountRetrieved,
            safeMode
        );

        // emit saving created
        emit SavfeHelperLib.SavingCreated(nameOfSaving, amountRetrieved, tokenToSave);
    }

    ///
    /// INCREMENT SAVING
    ///    the amount to add to saving
    ///
    ///    string nameOfSaving
    ///
    function incrementSaving(string memory nameOfSavings, address tokenToRetrieve, uint256 amount)
        public
        payable
        registeredOnly(msg.sender)
    {
        // initialize userChildContract
        address payable userChildContractAddress = payable(addressToUserBS[msg.sender]);
        ChildSavfe userChildContract = ChildSavfe(userChildContractAddress);

        address savingToken = userChildContract.getSavingTokenId(nameOfSavings);
        bool isNativeToken = savingToken == address(0);
        // todo: perform amount conversion and everything
        uint256 savingPlusAmount = amount;
        // todo: check savings detail by reading the storage of userChildContract
        bool isSafeMode = userChildContract.getSavingMode(nameOfSavings);
        if (isSafeMode) {
            // savingPlusAmount = crossChainSwap(
            //     userChildContract.getSavingTokenId(nameOfSavings),
            //     stableCoin,
            //     savingPlusAmount,
            //     address(this)
            // );
            tokenToRetrieve = address(stableCoin);
        }
        if (!isNativeToken) {
            // approve child contract withdrawing token
            require(
                SavfeHelperLib.approveAmount(userChildContractAddress, savingPlusAmount, tokenToRetrieve),
                "Savings invalid"
            );
        } else {
            savingPlusAmount = handleNativeSaving(amount, savingToken, userChildContractAddress);
        }

        // call withdrawSavings

        userChildContract.incrementSaving{
            value: isNativeToken ? ChildContractGasFee + savingPlusAmount : ChildContractGasFee
        }(nameOfSavings, savingPlusAmount, ChildContractGasFee);
    }

    /// WITHDRAW savings
    ///
    ///    string nameOfSaving
    ///
    function withdrawSaving(string memory nameOfSavings) public registeredOnly(msg.sender) returns (bool) {
        // initialize user's child userChildContract
        ChildSavfe userChildContract = ChildSavfe(payable(addressToUserBS[msg.sender]));
        // call withdraw savings fn
        userChildContract.withdrawSaving(nameOfSavings);
        return true;
    }

    receive() external payable {
        emit SavfeHelperLib.Received(msg.sender, msg.value);
    }

    // ---------- Private functions ---------------
    function getUserChildContractAddress(address myAddress) internal view returns (address payable) {
        return payable(addressToUserBS[myAddress]);
    }
}
