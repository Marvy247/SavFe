pragma solidity ^0.8.13;

import "../../src/mocks/MockERC20.sol"; // Import the mock token

abstract contract SavfeConfigs {
    MockERC20 public stableCoin;
    MockERC20 public svToken;
    bytes rawSalt = "x99x99";

    constructor() {
        stableCoin = new MockERC20("MockStableCoin", "MSC");
        svToken = new MockERC20("MocksvToken", "MCS");
    }
}