// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RotatingSavingsGroupFactory is ReentrancyGuard {
    address public savfeContract;

    constructor(address _savfeContract) {
        savfeContract = _savfeContract;
    }
    struct Group {
        address creator;
        address[] members;
        uint256 contributionAmount;
        uint256 contributionPeriod;
        uint256 currentRound;
        uint256 lastPayoutTime;
        uint256 contributionsThisRound;
        uint256 pot; // ✅ Track contributions (after fee deduction)
        bool exists;
    }

    uint256 public groupCounter;
    uint256 public contractEarnings; // ✅ Accumulated fees
    mapping(uint256 => Group) private groups;
    mapping(uint256 => mapping(address => bool)) private hasContributedThisRound;

    // Messaging system
    struct Message {
        address sender;
        string content;
        uint256 timestamp;
    }

    // Challenge system
    struct Challenge {
        address creator;
        string name;
        uint256 targetAmount;
        uint256 duration;
        uint256 startTime;
        uint256 totalContributions;
        bool active;
        mapping(address => uint256) contributions;
        address[] participants;
    }

    mapping(uint256 => Message[]) private groupMessages;
    mapping(uint256 => Challenge) private challenges;
    uint256 public challengeCounter;

    event GroupCreated(uint256 indexed groupId, address indexed creator, uint256 contributionAmount, uint256 contributionPeriod);
    event JoinedGroup(uint256 indexed groupId, address indexed member);
    event ContributionMade(uint256 indexed groupId, address indexed member, uint256 amount, uint256 fee);
    event PayoutMade(uint256 indexed groupId, uint256 round, address indexed beneficiary, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);
    event MessageSent(uint256 indexed groupId, address indexed sender, string content, uint256 timestamp);
    event ChallengeCreated(uint256 indexed challengeId, address indexed creator, string name, uint256 targetAmount, uint256 duration);
    event ChallengeJoined(uint256 indexed challengeId, address indexed participant);
    event ChallengeContribution(uint256 indexed challengeId, address indexed participant, uint256 amount);
    event ChallengeCompleted(uint256 indexed challengeId, address indexed winner);

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
        require(!hasContributedThisRound[_groupId][msg.sender], "Already contributed this round");

        // ✅ Deduct fee once
        uint256 fee = (msg.value * 1) / 100;
        contractEarnings += fee;

        // ✅ Add only net contribution to group pot
        currentGroup.pot += (msg.value - fee);

        hasContributedThisRound[_groupId][msg.sender] = true;
        currentGroup.contributionsThisRound++;

        emit ContributionMade(_groupId, msg.sender, msg.value, fee);

        // ✅ When all members contribute, payout is triggered automatically
        if (currentGroup.contributionsThisRound == currentGroup.members.length) {
            _payout(_groupId);
        }
    }

    /// @notice Internal payout function
    function _payout(uint256 _groupId) internal nonReentrant {
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
            hasContributedThisRound[_groupId][currentGroup.members[i]] = false;
        }
        currentGroup.contributionsThisRound = 0;
        currentGroup.currentRound++;
        currentGroup.lastPayoutTime = block.timestamp;
    }

    /// @notice Withdraw platform earnings
    function withdrawEarnings(address payable _to) external nonReentrant {
        require(contractEarnings > 0, "No earnings to withdraw");
        require(_to != address(0), "Invalid withdrawal address");
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

    /// @notice Get group status (0: Active, 1: Completed, 2: Inactive)
    function getGroupStatus(uint256 _groupId) external view returns (uint8) {
        Group storage group = groups[_groupId];
        require(group.exists, "Group does not exist");

        if (group.members.length == 0) return 2; // Inactive
        if (group.currentRound > group.members.length) return 1; // Completed
        return 0; // Active
    }

    /// @notice Trigger automatic payout manually
    function triggerAutomaticPayout(uint256 _groupId) external {
        Group storage currentGroup = groups[_groupId];
        require(currentGroup.exists, "Group does not exist");
        require(currentGroup.contributionsThisRound == currentGroup.members.length, "Not all members have contributed");

        _payout(_groupId);
    }



    /// @notice Create a new challenge
    function createChallenge(string memory _name, uint256 _targetAmount, uint256 _duration) external {
        require(_targetAmount > 0, "Target amount must be > 0");
        require(_duration > 0, "Duration must be > 0");
        require(bytes(_name).length > 0, "Name cannot be empty");

        challengeCounter++;
        Challenge storage newChallenge = challenges[challengeCounter];
        newChallenge.creator = msg.sender;
        newChallenge.name = _name;
        newChallenge.targetAmount = _targetAmount;
        newChallenge.duration = _duration;
        newChallenge.startTime = block.timestamp;
        newChallenge.active = true;

        emit ChallengeCreated(challengeCounter, msg.sender, _name, _targetAmount, _duration);
    }

    /// @notice Join a challenge
    function joinChallenge(uint256 _challengeId) external {
        Challenge storage challenge = challenges[_challengeId];
        require(challenge.active, "Challenge is not active");
        require(block.timestamp < challenge.startTime + challenge.duration, "Challenge has ended");

        // Check if already joined
        for (uint256 i = 0; i < challenge.participants.length; i++) {
            require(challenge.participants[i] != msg.sender, "Already joined this challenge");
        }

        challenge.participants.push(msg.sender);
        emit ChallengeJoined(_challengeId, msg.sender);
    }

    /// @notice Contribute to a challenge
    function contributeToChallenge(uint256 _challengeId) external payable {
        Challenge storage challenge = challenges[_challengeId];
        require(challenge.active, "Challenge is not active");
        require(block.timestamp < challenge.startTime + challenge.duration, "Challenge has ended");
        require(msg.value > 0, "Contribution must be > 0");

        // Check if participant
        bool isParticipant = false;
        for (uint256 i = 0; i < challenge.participants.length; i++) {
            if (challenge.participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }
        require(isParticipant, "Not a participant in this challenge");

        challenge.contributions[msg.sender] += msg.value;
        challenge.totalContributions += msg.value;

        emit ChallengeContribution(_challengeId, msg.sender, msg.value);
    }

    /// @notice Complete a challenge and distribute rewards
    function completeChallenge(uint256 _challengeId) external nonReentrant {
        Challenge storage challenge = challenges[_challengeId];
        require(challenge.active, "Challenge is not active");
        require(block.timestamp >= challenge.startTime + challenge.duration, "Challenge has not ended yet");

        challenge.active = false;

        // Find winner (participant with highest contribution)
        address winner = address(0);
        uint256 maxContribution = 0;

        for (uint256 i = 0; i < challenge.participants.length; i++) {
            address participant = challenge.participants[i];
            uint256 contribution = challenge.contributions[participant];
            if (contribution > maxContribution) {
                maxContribution = contribution;
                winner = participant;
            }
        }

        if (winner != address(0)) {
            // Transfer total contributions to winner
            (bool success,) = payable(winner).call{value: challenge.totalContributions}("");
            require(success, "Reward transfer failed");

            emit ChallengeCompleted(_challengeId, winner);
        }
    }






}
