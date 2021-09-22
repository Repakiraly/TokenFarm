pragma solidity ^0.5.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
    //All Code
    string public name = "DApp TOken Farm";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;
    

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DappToken _dappToken, DaiToken _daiToken) public {
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    //1. Stake Tokens (Deposit)
    function stakeTokens(uint _amount) public{
        //Require Staking more than 0
        require(_amount > 0,"amount cannot be 0");
        //Transfer Mock Dai Tokens for this contract for staking
        daiToken.transferFrom(msg.sender, address(this), _amount);
        //Update Staking balance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
        //Add user into array +only+ if they didn't stake before
        if(!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        //Update staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //2. Issuing Tokens (Interest)
    function issueTokens() public {
        //Only owner can call the function
        require(msg.sender == owner, "caller must be the owner");
        for (uint i = 0; i<stakers.length; i++) {
           address recipient =  stakers[i];
           uint balance = stakingBalance[recipient];
           if(balance > 0) {
               dappToken.transfer(recipient, balance);
           }
           
        }
    }

    //3. Unstaking Tokens (Withdraw)
    function unstakeTokens () public {
        //Fetch Balance
        uint balance = stakingBalance[msg.sender];
        require(balance > 0,"Address must have valid balance (>0)");
        //Transfer Dai Tokens to investor
        daiToken.transfer(msg.sender,balance);
        //Reset balance 
        stakingBalance[msg.sender] = 0;
        //Reset staking 
        isStaking[msg.sender] = false;
    }
    

}