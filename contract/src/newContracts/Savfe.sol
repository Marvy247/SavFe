// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ChildContract.sol";
import "./SavfeHelperLib.sol";

contract Savfe is ReentrancyGuard, Pausable, Ownable {
    // *** Contract parameters ***
    IERC20 public stableCoin;
    address public factoryContract; // For integration with RotatingSavingsGroupFactory

    // *** Fountain ***
    uint256 public fountain;

    // *** Storage ***
    mapping(address => address) addressToUserBS;
    uint256 public userCount;

    // *** savings values ***
    uint256 public JoinLimitFee = 0 ether;
    uint256 public SavingFee = 0.0001 ether;
    uint256 public ChildContractGasFee = SavingFee / 20;

    // *** User analytics ***
    mapping(address => uint256) public userGroupJoins;

    // *** Emergency ***
    bool public emergencyMode;

    event EmergencyModeActivated();
    event EmergencyModeDeactivated();
    event FactoryContractSet(address indexed factory);

    constructor(address _stableCoin) payable Ownable(msg.sender) {
        stableCoin = IERC20(_stableCoin);
        userCount = 0;
        fountain = msg.value;
        emergencyMode = false;
    }

    modifier inhouseOnly() {
        if (msg.sender != owner()) {
            revert SavfeHelperLib.MasterCallRequired();
        }
        _;
    }

    modifier notInEmergency() {
        require(!emergencyMode, "Emergency mode active");
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

    function joinSavfe() public whenNotPaused notInEmergency returns (address) {
        address ownerAddress = msg.sender;
        address currAddr = addressToUserBS[ownerAddress];
        if (currAddr != address(0)) {
            return currAddr;
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
        nonReentrant
        returns (bool)
    {
        require(amount > 0, "Amount must be > 0");
        require(ownerAddress != address(0), "Invalid owner address");
        // retrieve stable coin used from owner address
        return SavfeHelperLib.retrieveToken(msg.sender, address(stableCoin), amount);
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

    /// @notice Set child contract gas fee
    function setChildContractGasFee(uint256 _fee) external inhouseOnly {
        ChildContractGasFee = _fee;
    }

    /// @notice Set join limit fee
    function setJoinLimitFee(uint256 _fee) external inhouseOnly {
        JoinLimitFee = _fee;
    }

    /// @notice Set saving fee
    function setSavingFee(uint256 _fee) external inhouseOnly {
        SavingFee = _fee;
        ChildContractGasFee = _fee / 20;
    }

    /// @notice Withdraw fees to specified address
    function withdrawFee(address payable _to) external inhouseOnly nonReentrant {
        require(_to != address(0), "Invalid withdrawal address");
        require(address(this).balance >= fountain, "Insufficient balance above fountain");
        uint256 withdrawableAmount = address(this).balance - fountain;
        require(withdrawableAmount > 0, "No fees to withdraw");

        (bool success,) = _to.call{value: withdrawableAmount}("");
        require(success, "Fee withdrawal failed");
    }

    function dripFountain() public inhouseOnly nonReentrant {
        // send balance - fountain to owner
        uint256 balance = address(this).balance;
        if (balance > fountain) {
            payable(owner()).transfer(balance - fountain);
        }
    }

    /// @notice Set factory contract address for integration
    function setFactoryContract(address _factory) external inhouseOnly {
        require(_factory != address(0), "Invalid factory address");
        factoryContract = _factory;
        emit FactoryContractSet(_factory);
    }

    /// @notice Emergency pause all operations
    function activateEmergencyMode() external inhouseOnly {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated();
    }

    /// @notice Deactivate emergency mode
    function deactivateEmergencyMode() external inhouseOnly {
        emergencyMode = false;
        _unpause();
        emit EmergencyModeDeactivated();
    }

    /// @notice Emergency withdrawal for users (only in emergency mode)
    function emergencyWithdraw(address user) external inhouseOnly {
        require(emergencyMode, "Not in emergency mode");
        address childContract = addressToUserBS[user];
        require(childContract != address(0), "User not registered");

        // Transfer any remaining balance to user
        uint256 balance = address(this).balance;
        if (balance > fountain) {
            payable(user).transfer(balance - fountain);
        }
    }

    /// @notice Get total users count
    function totalUsers() public view returns (uint256) {
        return userCount;
    }

    /// @notice Increment group joins for a user (only factory can call)
    function incrementGroupJoins(address user) external {
        require(msg.sender == factoryContract, "Only factory can increment");
        require(user != address(0), "Invalid user address");
        userGroupJoins[user]++;
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
    ) public payable registeredOnly(msg.sender) whenNotPaused notInEmergency nonReentrant {
        require(bytes(nameOfSaving).length > 0, "Saving name cannot be empty");
        require(msg.value >= SavingFee, SavfeHelperLib.InsufficientBalance("Insufficient funds to cover saving fee"));
        require(block.timestamp < maturityTime, SavfeHelperLib.InvalidTime());
        require(penaltyPercentage <= 100, SavfeHelperLib.ParameterOutOfRange("penaltyPercentage", "0-100"));
        require(tokenToSave == address(0) || tokenToSave == address(stableCoin), SavfeHelperLib.OperationNotAllowed("Only native or stablecoin supported"));

        // NOTE: For now, no safeMode since no swap contract
        if (safeMode) {
            revert SavfeHelperLib.NotSupported("Safe mode not yet implemented - use regular savings");
        }

        // user's child contract address
        address payable userChildContractAddress = getUserChildContractAddress(msg.sender);

        // Handle token sent
        uint256 amountRetrieved = handleNativeSaving(amount, tokenToSave, userChildContractAddress);

        /// send savings request to child contract with a little gas
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
        whenNotPaused
        notInEmergency
        nonReentrant
    {
        require(bytes(nameOfSavings).length > 0, "Saving name cannot be empty");
        require(amount > 0, "Amount must be > 0");

        address payable userChildContractAddress = payable(addressToUserBS[msg.sender]);
        ChildSavfe userChildContract = ChildSavfe(userChildContractAddress);

        address savingToken = userChildContract.getSavingTokenId(nameOfSavings);
        require(savingToken != address(0) || tokenToRetrieve == address(0), "Token mismatch");

        bool isNativeToken = savingToken == address(0);
        uint256 savingPlusAmount = amount;

        bool isSafeMode = userChildContract.getSavingMode(nameOfSavings);
        if (isSafeMode) {
            tokenToRetrieve = address(stableCoin);
        }

        if (!isNativeToken) {
            // For ERC20, approval is handled in createSaving, tokens transferred via transferFrom in ChildContract
        } else {
            savingPlusAmount = handleNativeSaving(amount, savingToken, userChildContractAddress);
        }

        userChildContract.incrementSaving{
            value: isNativeToken ? ChildContractGasFee + savingPlusAmount : ChildContractGasFee
        }(nameOfSavings, savingPlusAmount, ChildContractGasFee);
    }

    /// WITHDRAW savings
    ///
    ///    string nameOfSaving
    ///
    function withdrawSaving(string memory nameOfSavings)
        public
        registeredOnly(msg.sender)
        whenNotPaused
        notInEmergency
        nonReentrant
        returns (bool)
    {
        require(bytes(nameOfSavings).length > 0, "Saving name cannot be empty");

        ChildSavfe userChildContract = ChildSavfe(payable(addressToUserBS[msg.sender]));

        // Check if saving exists before attempting withdrawal
        ChildSavfe.SavingDataStruct memory saving = userChildContract.getSaving(nameOfSavings);
        require(saving.isValid, SavfeHelperLib.InvalidSaving());

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
