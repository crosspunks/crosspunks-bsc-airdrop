// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor () public ERC20("CrossPunks", "CP") {
        _mint(_msgSender(), 55 * 10**9 * 10**18);
    }
}
