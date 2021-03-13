// SPDX-License-Identifier: GPL-3.0

// deployed - https://kovan.etherscan.io/tx/0x55862118884ea2c80ae352a002b2c6573668839e1d58758e6aa31eaa34e15a3a

/**
*   Inspired from - https://soliditydeveloper.com/uniswap2
*   
    HOW TO USE

    Convert Ether to Token
    
    1. Calculate amountOut (how much token to receive) using getEstimatedTokenforETH() 
       for X amount of ETH
    2. Specify to (receiver)
    3. Specify order valid time in seconds
    4. Send X amount of ether (better to send x*1.1 amount to avoid trade revert) 


    Convert Token to Ether

    1. Specify amountIn (amount of sending token)
    2. Calculate amountOutMin using getEstimatedTokenforETH(amountIn). This gets the minimum 
       ether you want back. For a confirm trade its better to pass in (amountOutMin * 0.9)
       from frontend.
    3. Specify to and valid_upto_seconds

    * IMPORTANT - to in both functions depends on usecase. to can be a normal address or in some
      case it can also be the contract address itself. 

*/

pragma solidity 0.7.1;

import "https://github.com/Uniswap/uniswap-v2-periphery/blob/master/contracts/interfaces/IUniswapV2Router02.sol";

interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract UniswapExample {
  address internal constant UNISWAP_ROUTER_ADDRESS = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D ;

  IUniswapV2Router02 public uniswapRouter;
  
  //address private multiDaiKovan = 0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa;
  IERC20 ercToken;

  constructor(address _ercTokenAddress) {
    uniswapRouter = IUniswapV2Router02(UNISWAP_ROUTER_ADDRESS);
    ercToken = IERC20(_ercTokenAddress);
  }

  function convertEthToToken(uint amountOut, address to, uint valid_upto_seconds) public payable {
    //uint deadline = block.timestamp + valid_upto_seconds;; // using 'now' for convenience, for mainnet pass deadline from frontend!
    
    uint deadline = block.timestamp + valid_upto_seconds;
    uniswapRouter.swapETHForExactTokens{ value: msg.value }(amountOut, getPathForETHtoToken(), to, deadline);
    
    // refund leftover ETH to user
    (bool success,) = msg.sender.call{ value: address(this).balance }("");
    require(success, "refund failed");
  }
  
  function convertTokenToEth(uint amountIn, uint amountOutMin, address to, uint valid_upto_seconds) public payable 
    returns (uint[] memory amounts) 
  {
    // amountOutMin must be retrieved from an oracle of some kind
    IERC20 token = IERC20(ercToken);
    // This contract must have enough token balance to send
    require(token.balanceOf(address(this))>=amountIn, "token balance not enough for swap to ether");
    require(token.approve(address(uniswapRouter),0),'approve failed');
    require(token.approve(address(uniswapRouter),amountIn),'approve failed');
    uint deadline = block.timestamp + valid_upto_seconds;
    uint[] memory output_amounts = uniswapRouter.swapExactTokensForETH(amountIn, amountOutMin, getPathForTokentoETH(), to, deadline);      
    return output_amounts;
  }
  
  function getMinOutputforInput(uint tokenAmount) public view returns (uint[] memory) {
    return uniswapRouter.getAmountsIn(tokenAmount, getPathForETHtoToken());
  }
  
  function getMaxOutputForInput(uint EthAmount) public view returns (uint[] memory) {
    return uniswapRouter.getAmountsOut(EthAmount, getPathForTokentoETH());
  }

  function getPathForETHtoToken() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = uniswapRouter.WETH();
    path[1] = address(ercToken);
    
    return path;
  }
  
  function getPathForTokentoETH() private view returns (address[] memory) {
    address[] memory path = new address[](2);
    path[0] = address(ercToken);
    path[1] = uniswapRouter.WETH();
    
    return path;
  }

  function tokenBalanceOf(address account) returns(uint256) {
      return IERC20(ercToken).balanceOf(account);
  }

  function etherBalanceOf() returns(uint256) {
      return address(this).balance();
  } 
  
  // important to receive ETH
  receive() payable external {}
}