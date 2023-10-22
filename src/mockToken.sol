// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract mockTokenGood is ERC20{
    constructor() ERC20 ("Mock Token Bad", "GOOD"){
        _mint(msg.sender, 10000e18);
    }
    
}

contract mockTokenBad is ERC20{
    constructor() ERC20 ("Mock Token Bad", "BAD"){
        _mint(msg.sender, 10000e18);
    }
    
}