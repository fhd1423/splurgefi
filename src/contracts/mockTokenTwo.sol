// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenTwo is ERC20 {
    constructor() ERC20("token2", "2") {
        _mint(msg.sender, 1e6 * 1e18);
    }
}
