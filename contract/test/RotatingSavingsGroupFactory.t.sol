// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/RotatingSavingsGroupFactory.sol";

contract RotatingSavingsGroupFactoryTest is Test {
    RotatingSavingsGroupFactory factory;

    // events must match the contract's signatures (used only if we ever call expectEmit)
    event GroupCreated(uint256 indexed groupId, address indexed creator, uint256 contributionAmount, uint256 contributionPeriod);
    event JoinedGroup(uint256 indexed groupId, address indexed member);
    event ContributionMade(uint256 indexed groupId, address indexed member, uint256 amount, uint256 fee);
    event PayoutMade(uint256 indexed groupId, uint256 round, address indexed beneficiary, uint256 amount);
    event Withdrawn(address indexed member, uint256 amount);

    address userCreator;
    address user1;
    address user2;
    address user3;
    address user4;
    address recipient;

    uint256 constant CONTRIBUTION_AMOUNT = 1 ether;
    uint256 constant CONTRIBUTION_PERIOD = 1 days;

    function setUp() public {
        userCreator = makeAddr("creator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        user4 = makeAddr("user4");
        recipient = makeAddr("recipient"); // used for withdraw target

        // give them ETH for contributions
        deal(userCreator, 10 ether);
        deal(user1, 10 ether);
        deal(user2, 10 ether);
        deal(user3, 10 ether);
        deal(user4, 10 ether);
        deal(recipient, 0);

        // deploy factory
        vm.prank(userCreator);
        factory = new RotatingSavingsGroupFactory();
    }

    function test_CreateGroup_and_capture_members_array() public {
        // creator creates group (creator is NOT auto-added as member in this contract)
        vm.prank(userCreator);
        factory.createGroup(CONTRIBUTION_AMOUNT, CONTRIBUTION_PERIOD);

        // group id should be 1
        uint256 gId = factory.groupCounter();
        assertEq(gId, 1);

        // read group state and members array
        (address creator, address[] memory members, uint256 contributionAmount, uint256 contributionPeriod, uint256 currentRound, , uint256 contributionsThisRound, uint256 pot) = factory.getGroup(gId);

        assertEq(creator, userCreator);
        assertEq(contributionAmount, CONTRIBUTION_AMOUNT);
        assertEq(contributionPeriod, CONTRIBUTION_PERIOD);
        assertEq(currentRound, 1);
        assertEq(members.length, 0); // no members until joinGroup is called
        assertEq(contributionsThisRound, 0);
        assertEq(pot, 0);
    }

    function test_JoinGroup_and_members_array_content() public {
        vm.prank(userCreator);
        factory.createGroup(CONTRIBUTION_AMOUNT, CONTRIBUTION_PERIOD);
        uint256 gId = factory.groupCounter();

        // creator can join explicitly
        vm.prank(userCreator);
        factory.joinGroup(gId);

        // other user joins
        vm.prank(user1);
        factory.joinGroup(gId);

        ( , address[] memory members, , , , , , ) = factory.getGroup(gId);
        assertEq(members.length, 2);
        assertEq(members[0], userCreator);
        assertEq(members[1], user1);
    }

    function test_Contribute_emits_and_fees_accumulate() public {
        vm.prank(userCreator);
        factory.createGroup(CONTRIBUTION_AMOUNT, CONTRIBUTION_PERIOD);
        uint256 gId = factory.groupCounter();

        // have two members join
        vm.prank(userCreator); factory.joinGroup(gId);
        vm.prank(user1); factory.joinGroup(gId);

        // expect ContributionMade for userCreator when they contribute
        uint256 expectedFee = CONTRIBUTION_AMOUNT / 100; // 1%
        vm.expectEmit(true, true, false, true);
        emit ContributionMade(gId, userCreator, CONTRIBUTION_AMOUNT, expectedFee);

        vm.prank(userCreator);
        factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);

        (, , , , , , uint256 contributionsThisRound, uint256 pot) = factory.getGroup(gId);
        assertEq(contributionsThisRound, 1);
        // check pot equals net contribution
        assertEq(pot, CONTRIBUTION_AMOUNT - expectedFee);
        assertEq(factory.contractEarnings(), expectedFee);
    }

    function test_FullRoundAndPayout_and_state_reset() public {
        // 1. Create group and members join
        vm.prank(userCreator);
        factory.createGroup(CONTRIBUTION_AMOUNT, CONTRIBUTION_PERIOD);
        uint256 gId = factory.groupCounter();

        vm.prank(userCreator); factory.joinGroup(gId); // members[0] = userCreator
        vm.prank(user1); factory.joinGroup(gId);       // members[1] = user1
        vm.prank(user2); factory.joinGroup(gId);       // members[2] = user2
        vm.prank(user3); factory.joinGroup(gId);       // members[3] = user3

        // beneficiary for round 1 = members[0] = userCreator
        uint256 beforeBal = userCreator.balance;

        // 2. Three contributions (not last)
        vm.prank(userCreator); factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);
        vm.prank(user1);        factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);
        vm.prank(user2);        factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);

        // record logs only for the final contribution
        vm.recordLogs();

        // 3. final contribution triggers payout
        vm.prank(user3);
        factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);

        Vm.Log[] memory entries = vm.getRecordedLogs();

        // compute expected payout: net per contribution = amount - fee
        uint256 fee = CONTRIBUTION_AMOUNT / 100;
        uint256 netPer = CONTRIBUTION_AMOUNT - fee;
        uint256 expectedPayout = netPer * 4; // 4 members

        // find PayoutMade event in recorded logs and validate
        bool foundPayout = false;
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics.length == 0) continue;
            if (entries[i].topics[0] == keccak256("PayoutMade(uint256,uint256,address,uint256)")) {
                foundPayout = true;

                // topics: [sig, groupId (indexed), beneficiary (indexed)] because contract declared groupId indexed and beneficiary indexed
                uint256 loggedGroupId = uint256(entries[i].topics[1]);
                address beneficiary = address(uint160(uint256(entries[i].topics[2])));
                // data contains (round, amount) in order (both non-indexed or partially non-indexed depending on declaration)
                (uint256 round, uint256 amount) = abi.decode(entries[i].data, (uint256, uint256));

                assertEq(loggedGroupId, gId, "wrong groupId in log");
                assertEq(beneficiary, userCreator, "wrong beneficiary");
                assertEq(round, 1, "round should be 1 for first payout");
                assertEq(amount, expectedPayout, "payout amount mismatch");
            }
        }
        assertTrue(foundPayout, "PayoutMade event not emitted on final contribution");

        // 4. validate final balances and group state
        uint256 afterBal = userCreator.balance;
        // userCreator contributed once (-CONTRIBUTION_AMOUNT) and received expectedPayout
        assertEq(afterBal, beforeBal - CONTRIBUTION_AMOUNT + expectedPayout);

        (
            ,
            ,
            ,
            ,
            uint256 currentRound,
            ,
            uint256 contributionsThisRound,
            uint256 pot
        ) = factory.getGroup(gId);

        assertEq(currentRound, 2, "round should have incremented");
        assertEq(contributionsThisRound, 0, "contributionsThisRound should reset to 0");
        assertEq(pot, 0, "pot should be emptied after payout");
    }

    function test_withdrawEarnings_and_zero_after() public {
        vm.prank(userCreator);
        factory.createGroup(CONTRIBUTION_AMOUNT, CONTRIBUTION_PERIOD);
        uint256 gId = factory.groupCounter();

        vm.prank(userCreator); factory.joinGroup(gId);
        vm.prank(user1); factory.joinGroup(gId);

        // two contributions to produce earnings (fee 1% each)
        vm.prank(userCreator); factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);
        vm.prank(user1);       factory.contribute{value: CONTRIBUTION_AMOUNT}(gId);

        uint256 earnings = factory.contractEarnings();
        assertTrue(earnings > 0);

        // call withdrawEarnings to recipient address
        uint256 before = recipient.balance;
        // withdrawEarnings has no access control in contract, anyone can call and pass an address
        vm.prank(userCreator);
        factory.withdrawEarnings(payable(recipient));
        assertEq(recipient.balance, before + earnings);

        assertEq(factory.contractEarnings(), 0, "contractEarnings should be zero after withdrawal");
    }
}
