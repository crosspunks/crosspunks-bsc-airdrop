// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Airdrop is Ownable {
    IERC20 public token;

    constructor(address _token) public {
        token = IERC20(_token);
    }

    function airdrop(address[] memory _recipients, uint256[] memory _values) external onlyOwner {
        require(_recipients.length == _values.length, "The number of recipients is not equal to the number of values");
        for (uint i = 0; i < _values.length; i++) {
            require(_values[i] > 0, "Balance less than zero");
            token.transfer(_recipients[i], _values[i] * 1000 ether);
        }
    }

    function withdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        token.transfer(msg.sender, balance);
    }
}
