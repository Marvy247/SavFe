// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RotatingSavingsGroupFactory {
    struct Group {
        address creator;
        address[] members;
        uint256 contributionAmount;
        uint256 contributionPeriod;
        uint256 currentRound;
        uint256 lastPayoutTime;
        uint256 contributionsThisRound;
        uint256 pot; // ✅ Track contributions (after fee deduction)
        mapping(address => bool) hasContributedThisRound;
        bool exists;
    }

    uint256 public groupCounter;
    uint256 public contractEarnings; // ✅ Accumulated fees
    mapping(uint256 => Group) private groups;

    event GroupCreated(uint256 indexed groupId, address indexed creator, uint256 contributionAmount, uint256 contributionPeriod);
    event JoinedGroup(uint256 indexed groupId, address indexed member);
    event ContributionMade(uint256 indexed groupId, address indexed member, uint256 amount, uint256 fee);
    event PayoutMade(uint256 indexed groupId, uint256 round, address indexed beneficiary, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);

    /// @notice Create a new rotating savings group
    function createGroup(uint256 _contributionAmount, uint256 _contributionPeriod) external {
        require(_contributionAmount > 0, "Contribution must be > 0");
        require(_contributionPeriod > 0, "Contribution period must be > 0");

        groupCounter++;
        Group storage newGroup = groups[groupCounter];
        newGroup.creator = msg.sender;
        newGroup.contributionAmount = _contributionAmount;
        newGroup.contributionPeriod = _contributionPeriod;
        newGroup.currentRound = 1;
        newGroup.lastPayoutTime = block.timestamp;
        newGroup.exists = true;

        emit GroupCreated(groupCounter, msg.sender, _contributionAmount, _contributionPeriod);
    }

    /// @notice Join an existing group
    function joinGroup(uint256 _groupId) external {
        Group storage group = groups[_groupId];
        require(group.exists, "Group does not exist");

        for (uint256 i = 0; i < group.members.length; i++) {
            require(group.members[i] != msg.sender, "Already a member");
        }

        group.members.push(msg.sender);
        emit JoinedGroup(_groupId, msg.sender);
    }

    /// @notice Contribute to a group
    function contribute(uint256 _groupId) external payable {
        Group storage currentGroup = groups[_groupId];
        require(currentGroup.exists, "Group does not exist");
        require(msg.value == currentGroup.contributionAmount, "Incorrect contribution amount");
        require(!currentGroup.hasContributedThisRound[msg.sender], "Already contributed this round");

        // ✅ Deduct fee once
        uint256 fee = (msg.value * 1) / 100;
        contractEarnings += fee;

        // ✅ Add only net contribution to group pot
        currentGroup.pot += (msg.value - fee);

        currentGroup.hasContributedThisRound[msg.sender] = true;
        currentGroup.contributionsThisRound++;

        emit ContributionMade(_groupId, msg.sender, msg.value, fee);

        // ✅ When all members contribute, payout is triggered automatically
        if (currentGroup.contributionsThisRound == currentGroup.members.length) {
            _payout(_groupId);
        }
    }

    /// @notice Internal payout function
    function _payout(uint256 _groupId) internal {
        Group storage currentGroup = groups[_groupId];
        require(currentGroup.exists, "Group does not exist");

        address beneficiary = currentGroup.members[
            (currentGroup.currentRound - 1) % currentGroup.members.length
        ];

        uint256 payoutAmount = currentGroup.pot;
        currentGroup.pot = 0; // ✅ reset pot for next round

        (bool success, ) = payable(beneficiary).call{value: payoutAmount}("");
        require(success, "Payout transfer failed");

        emit PayoutMade(_groupId, currentGroup.currentRound, beneficiary, payoutAmount);

        _resetForNextRound(_groupId);
    }

    /// @notice Reset for next round
    function _resetForNextRound(uint256 _groupId) internal {
        Group storage currentGroup = groups[_groupId];
        for (uint256 i = 0; i < currentGroup.members.length; i++) {
            currentGroup.hasContributedThisRound[currentGroup.members[i]] = false;
        }
        currentGroup.contributionsThisRound = 0;
        currentGroup.currentRound++;
        currentGroup.lastPayoutTime = block.timestamp;
    }

    /// @notice Withdraw platform earnings
    function withdrawEarnings(address payable _to) external {
        require(contractEarnings > 0, "No earnings to withdraw");
        uint256 amount = contractEarnings;
        contractEarnings = 0;
        (bool success, ) = _to.call{value: amount}("");
        require(success, "Withdraw transfer failed");

        emit Withdrawn(_to, amount);
    }

    /// @notice Get group info
    function getGroup(uint256 _groupId) external view returns (
        address creator,
        address[] memory members,
        uint256 contributionAmount,
        uint256 contributionPeriod,
        uint256 currentRound,
        uint256 lastPayoutTime,
        uint256 contributionsThisRound,
        uint256 pot
    ) {
        Group storage g = groups[_groupId];
        return (
            g.creator,
            g.members,
            g.contributionAmount,
            g.contributionPeriod,
            g.currentRound,
            g.lastPayoutTime,
            g.contributionsThisRound,
            g.pot
        );
    }
}
