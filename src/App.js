import './App.css';
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import JSBI from 'jsbi/dist/jsbi.mjs';
const { ethers, BigNumber } = require("ethers");
const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent, CurrencyAmount } = require('@uniswap/sdk')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const NETWORK = 'KOVAN';

const UniswapV2Router02 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const defiTokens = {
    "DAI": {
        "name": "Dai",
        "address": "0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa",
        "decimals": 18,
        "abi": '[{"name": "Transfer", "inputs": [{"type": "address", "name": "_from", "indexed": true}, {"type": "address", "name": "_to", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"name": "Approval", "inputs": [{"type": "address", "name": "_owner", "indexed": true}, {"type": "address", "name": "_spender", "indexed": true}, {"type": "uint256", "name": "_value", "indexed": false}], "anonymous": false, "type": "event"}, {"outputs": [], "inputs": [{"type": "string", "name": "_name"}, {"type": "string", "name": "_symbol"}, {"type": "uint256", "name": "_decimals"}, {"type": "uint256", "name": "_supply"}], "constant": false, "payable": false, "type": "constructor"}, {"name": "transfer", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 74020}, {"name": "transferFrom", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_from"}, {"type": "address", "name": "_to"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 110371}, {"name": "approve", "outputs": [{"type": "bool", "name": "out"}], "inputs": [{"type": "address", "name": "_spender"}, {"type": "uint256", "name": "_value"}], "constant": false, "payable": false, "type": "function", "gas": 37755}, {"name": "name", "outputs": [{"type": "string", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 6402}, {"name": "symbol", "outputs": [{"type": "string", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 6432}, {"name": "decimals", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 663}, {"name": "totalSupply", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 693}, {"name": "balanceOf", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "arg0"}], "constant": true, "payable": false, "type": "function", "gas": 877}, {"name": "allowance", "outputs": [{"type": "uint256", "name": "out"}], "inputs": [{"type": "address", "name": "arg0"}, {"type": "address", "name": "arg1"}], "constant": true, "payable": false, "type": "function", "gas": 1061}]',
    },
    "USDC": {
        "name": "USDC",
        "address": "0x2F375e94FC336Cdec2Dc0cCB5277FE59CBf1cAe5",
        "decimals": 6,
        "abi": '[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationCanceled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"authorizer","type":"address"},{"indexed":true,"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"AuthorizationUsed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"Blacklisted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newBlacklister","type":"address"}],"name":"BlacklisterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"burner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newMasterMinter","type":"address"}],"name":"MasterMinterChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"minter","type":"address"},{"indexed":false,"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"MinterConfigured","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldMinter","type":"address"}],"name":"MinterRemoved","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[],"name":"Pause","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newAddress","type":"address"}],"name":"PauserChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newRescuer","type":"address"}],"name":"RescuerChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_account","type":"address"}],"name":"UnBlacklisted","type":"event"},{"anonymous":false,"inputs":[],"name":"Unpause","type":"event"},{"inputs":[],"name":"APPROVE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CANCEL_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DECREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"INCREASE_ALLOWANCE_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TRANSFER_WITH_AUTHORIZATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"approveWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"}],"name":"authorizationState","outputs":[{"internalType":"enum GasAbstraction.AuthorizationState","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"blacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"blacklister","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"authorizer","type":"address"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"cancelAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"},{"internalType":"uint256","name":"minterAllowedAmount","type":"uint256"}],"name":"configureMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currency","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"decrement","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"decreaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"increment","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"increaseAllowanceWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"tokenName","type":"string"},{"internalType":"string","name":"tokenSymbol","type":"string"},{"internalType":"string","name":"tokenCurrency","type":"string"},{"internalType":"uint8","name":"tokenDecimals","type":"uint8"},{"internalType":"address","name":"newMasterMinter","type":"address"},{"internalType":"address","name":"newPauser","type":"address"},{"internalType":"address","name":"newBlacklister","type":"address"},{"internalType":"address","name":"newOwner","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"}],"name":"initializeV2","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"isBlacklisted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"masterMinter","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"minterAllowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pauser","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"minter","type":"address"}],"name":"removeMinter","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IERC20","name":"tokenContract","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"rescueERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescuer","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"validAfter","type":"uint256"},{"internalType":"uint256","name":"validBefore","type":"uint256"},{"internalType":"bytes32","name":"nonce","type":"bytes32"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"transferWithAuthorization","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_account","type":"address"}],"name":"unBlacklist","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBlacklister","type":"address"}],"name":"updateBlacklister","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newMasterMinter","type":"address"}],"name":"updateMasterMinter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newPauser","type":"address"}],"name":"updatePauser","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newRescuer","type":"address"}],"name":"updateRescuer","outputs":[],"stateMutability":"nonpayable","type":"function"}]'
    }
}

const WETH_TO_ERCTOKEN = async (INPUT_TOKEN = {}) => {

    if (typeof process.env.REACT_APP_USER_PRIVATE_KEY !== "string") {
        return console.error("env not set");
    }

    const USER_PRIVATE_KEY = Buffer.from(process.env.REACT_APP_USER_PRIVATE_KEY, 'hex');

    const receiverAddress = ethers.utils.getAddress(process.env.REACT_APP_USER_ETH_ADDRESS);
    console.log(receiverAddress);
    let tradeAmount = Number(document.getElementById('eth_amount').value);

    if (tradeAmount <= 0) {
        alert("Invalid amount entered");
        return false;
    }

    tradeAmount = tradeAmount.toString();

    const chainId = ChainId[NETWORK];

    let max_trade_life = 20;

    console.log(ethers.utils.getAddress(INPUT_TOKEN['address']));
    const dai = await Fetcher.fetchTokenData(chainId, ethers.utils.getAddress(INPUT_TOKEN['address']))
    const weth = WETH[chainId]
    const pair = await Fetcher.fetchPairData(dai, weth)
    const route = new Route([pair], weth)
    // Convert input amount in wei
    const tradeAmountWei = ethers.utils.parseEther(tradeAmount);
    //console.log(tradeAmountWei);
    if (tradeAmountWei.isNegative()) {
        throw new Error("Invalid input amount of ether provided.");
    }
    const tradeAmountBN = new TokenAmount(weth, JSBI.BigInt(tradeAmountWei));

    //console.log(tradeAmountBN);
    const trade = new Trade(route, tradeAmountBN, TradeType.EXACT_INPUT)
    //console.log(trade);
    console.log("Input amount",trade.inputAmount.toExact());
    console.log("Output amount",trade.outputAmount.toExact());

    //console.log(trade.execution_price);
    const weth_to_dai = route.midPrice.toSignificant(6)
    const dai_to_weth = route.midPrice.invert().toSignificant(6)
    const execution_price = trade.executionPrice.toSignificant(6)
    const nextMidPrice = trade.nextMidPrice.toSignificant(6)
    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%
    // Decimal values when converted to BigInt fail later in tx. Need to convert to Int
    let amountOutMin = ethers.utils.parseUnits(trade.minimumAmountOut(slippageTolerance).toExact(), INPUT_TOKEN['decimals']) // needs to be converted to e.g. hex
    amountOutMin = amountOutMin['_hex'];

    let proceed_to_trade = window.confirm(`You will get minimum ${ethers.utils.formatUnits(amountOutMin, INPUT_TOKEN['decimals'])} ${INPUT_TOKEN['name']}s after the trade. Proceed?`);
    if (!proceed_to_trade) return false;

    const path = [weth.address, dai.address]
    const to = receiverAddress // should be a checksummed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * max_trade_life // 20 minutes from the current Unix time

    // Convert input amount back to wei
    const value = tradeAmountWei._hex // // needs to be converted to e.g. hex

    console.log(`1 weth to ${INPUT_TOKEN['name']}: `, weth_to_dai);
    console.log(`1 ${INPUT_TOKEN['name']} to weth: `, dai_to_weth);
    console.log("execution_price: ", execution_price);
    console.log("nextMidPrice: ", nextMidPrice);

   // const provider = new ethers.providers.Web3Provider(window.ethereum)
    const provider = ethers.getDefaultProvider(NETWORK.toLowerCase(), {
        infura: process.env.REACT_APP_INFURA_API_KEY
    })

    const signer = new ethers.Wallet(USER_PRIVATE_KEY);
    const account = signer.connect(provider);
    const uniswap = new ethers.Contract(
        '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        [`function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        payable
        returns (uint[] memory amounts)`],
        account
    );

    let gasPrice = await provider.getGasPrice();
    //console.log(gasPrice._hex);
    //console.log(value);

    const tx = await uniswap.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        { value, gasPrice: gasPrice._hex }
    )

    console.log('Tx Hash:', tx.hash);
    alert(`Tx successful. Please visit ${NETWORK} network block explorer to see tx: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(receipt.blockNumber);

}

const ERCTOKEN_TO_WETH = async (INPUT_TOKEN = {}) => {

    try {

        if (typeof process.env.REACT_APP_USER_PRIVATE_KEY !== "string") {
            return console.error("env not set");
        }

        const USER_PRIVATE_KEY = Buffer.from(process.env.REACT_APP_USER_PRIVATE_KEY, 'hex');

        const receiverAddress = ethers.utils.getAddress(process.env.REACT_APP_USER_ETH_ADDRESS);
        console.log(receiverAddress);
        let tradeAmount = document.getElementById('ercToken_amount').value;

        // Convert input amount in wei
        const tradeAmountWei = ethers.utils.parseUnits(tradeAmount, INPUT_TOKEN['decimals']);
        console.log(tradeAmountWei);

        if (tradeAmountWei.isNegative()) {
            alert("Invalid amount entered");
            return false;
        }
        
        const chainId = ChainId[NETWORK];
        
        let max_trade_life = 20;
        const tokenAddress = ethers.utils.getAddress(INPUT_TOKEN['address']);
        
        const ercToken = await Fetcher.fetchTokenData(chainId, tokenAddress)
        const weth = WETH[chainId]
        const pair = await Fetcher.fetchPairData(weth, ercToken)
        const route = new Route([pair], ercToken);
        const tradeAmountBN = new TokenAmount(ercToken, JSBI.BigInt(tradeAmountWei));
        //console.log(tradeAmountBN);
        
        const trade = new Trade(route, tradeAmountBN, TradeType.EXACT_INPUT)
        //console.log(trade.inputAmount.toExact());
        //console.log(trade.outputAmount.toExact());
        console.log(trade);

        // Convert input amount back to wei
        const amountIn = tradeAmountWei._hex;

        //console.log(trade.execution_price);
        const ercToken_to_weth = route.midPrice.toSignificant(6)
        const weth_to_ercToken = route.midPrice.invert().toSignificant(6)
        const execution_price = trade.executionPrice.toSignificant(6)
        const nextMidPrice = trade.nextMidPrice.toSignificant(6)
        
        // Extract maximum ether possible and multiply by 0.9 to increase chance of swap
        let amountOutMin = ethers.utils.parseEther(trade.outputAmount.toExact()).mul(9).div(10) 
        console.log(amountOutMin);
        amountOutMin = amountOutMin['_hex'];

        let proceed_to_trade = window.confirm(`You will get minimum ${ethers.utils.formatEther(amountOutMin)} ethers after the trade. Proceed?`);
        if (!proceed_to_trade) return false;

        const path = [ercToken.address, weth.address]
        const to = receiverAddress // should be a checksummed recipient address
        const deadline = Math.floor(Date.now() / 1000) + 60 * max_trade_life // 20 minutes from the current Unix time

        console.log(`1 ${INPUT_TOKEN['name']} to weth: `, ercToken_to_weth);
        console.log(`1 weth to ${INPUT_TOKEN['name']}: `, weth_to_ercToken);
        console.log("Output Amount: ", trade.outputAmount.toExact());
        console.log("execution_price: ", execution_price);
        console.log("nextMidPrice: ", nextMidPrice);

        const provider = ethers.getDefaultProvider(NETWORK.toLowerCase(), {
            infura: process.env.REACT_APP_INFURA_API_KEY
        })

        const signer = new ethers.Wallet(USER_PRIVATE_KEY);
        console.log(signer);
        const account = signer.connect(provider);
        console.log(account);



        const abi = JSON.parse(INPUT_TOKEN['abi']);
        //console.log(abi);

        const tokenContract = new ethers.Contract(tokenAddress, abi, account);
        console.log(tokenContract);
        const approve_tx = await tokenContract.approve(UniswapV2Router02, amountIn);

        // wait for the transaction to be mined
        const tx_approved = await approve_tx.wait();
        console.log(tx_approved);




        const uniswap = new ethers.Contract(
            '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            [`function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)
        external
        returns (uint[] memory amounts)`],
            account
        );

        // console.log(amountOutMin);
        // console.log(path);
        // console.log(to);
        // console.log(deadline);
        // console.log("gasPrice", 20e9);

        //return;
        let gasPrice = await provider.getGasPrice();
        //console.log(gasPrice._hex);

        //console.log(amountOutMin);
        //console.log(to);
        //console.log(path);

        const tx = await uniswap.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            to,
            deadline,
            { gasPrice: gasPrice._hex }
        );

        console.log('Tx Hash:', tx.hash);
        alert(`Tx successful. Please visit ${NETWORK} network block explorer to see tx: ${tx.hash}`);

        const receipt = await tx.wait();
        console.log(receipt.blockNumber);

    } catch (error) {
        throw new Error(error);
    }
}

function App() {

    // const [network, setNetwork] = useState(undefined);
    // const [buyingToken, setBuyingToken] = useState(undefined);
    // const [receiverAddress, setReceiverAddress] = useState(undefined);

    // useEffect(()=>{
    //     setNetwork('ROPSTEN');
    //     setBuyingToken('0xad6d458402f60fd3bd25163575031acdce07538d'); // Dai
    //     setReceiverAddress(process.env.REACT_APP_USER_ETH_ADDRESS);

    // }, []);

    return (
        <div className="container">
            <div className="alert alert-warning" role="alert">
                UI is under development. Please refer to App.js for better understanding of the app.
            </div>
            <div className="row">

                <div className="col-sm">
                    <div className="card">
                        <div className="card-header">
                            Uniswap: Buy ERCTOKEN for ETH (ROPSTEN)
                      </div>
                        <div className="card-body">
                            <h5>Enter amount in Ether</h5>
                            <div className="input-group">
                                <input type="text" className="form-control"
                                    id="eth_amount"
                                    aria-label="Ether amount (with dot and two decimal places)" />
                                <button onClick={() => WETH_TO_ERCTOKEN(defiTokens["DAI"])} className="btn btn-primary">ETH Amount</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm">

                </div>

                <div className="col-sm">
                    <div className="card">
                        <div className="card-header">
                            Uniswap: Buy ETH for ERCTokens (ROPSTEN)
                      </div>
                        <div className="card-body">
                            <h5>Enter amount in ERCTokens</h5>
                            <div className="input-group">
                                <input type="text" className="form-control"
                                    id="ercToken_amount"
                                    aria-label="Amount (with dot and two decimal places)" />
                                <button onClick={() => ERCTOKEN_TO_WETH(defiTokens["DAI"])} className="btn btn-primary">Token Amount</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
}

export default App;
