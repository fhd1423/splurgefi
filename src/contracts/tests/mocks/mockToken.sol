// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// solhint-disable-next-line no-global-import
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MOCK") {
        _mint(msg.sender, 10000e18);
    }
}
