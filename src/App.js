import './App.css';
import React, {useState, useEffect, useReducer, useCallback} from 'react';
const { ethers, BigNumber } = require("ethers");
const {ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent} = require('@uniswap/sdk')

//require('dotenv').config()
require('dotenv').config({ path: '../.env' })

// const [network, setNetwork] = useState(undefined);
// const [buyingToken, setBuyingToken] = useState(undefined);


const init = async() => {
    
    if(typeof process.env.REACT_APP_USER_PRIVATE_KEY !=="string") {
        return console.error("env not set");
    }
    
    const USER_PRIVATE_KEY = Buffer.from(process.env.REACT_APP_USER_PRIVATE_KEY, 'hex');

    const network = 'ROPSTEN';
    
    const defiTokens = {
        "DAI": "0xad6d458402f60fd3bd25163575031acdce07538d"
    }
    
    const receiverAddress = '0x512aC4F5b92ce3F8735CedA491360a01f5F9A7d6';
    const tradeAmount = '1000000000000000000';
    
    const chainId = ChainId[network];
    
    
    const tokenAddress = defiTokens["DAI"];
    let max_trade_life = 20;
    
    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress)
    const weth = WETH[chainId]
    const pair = await Fetcher.fetchPairData(dai, weth)
    const route = new Route([pair], weth)
    const tradeAmountBN = new TokenAmount(weth, tradeAmount);

    //console.log(tradeAmountBN);
    const trade = new Trade(route, tradeAmountBN, TradeType.EXACT_INPUT)
    //console.log(trade);
    //console.log(trade.execution_price);
    const weth_to_dai = route.midPrice.toSignificant(6)
    const dai_to_weth = route.midPrice.invert().toSignificant(6)
    const execution_price = trade.executionPrice.toSignificant(6)
    const nextMidPrice = trade.nextMidPrice.toSignificant(6)
    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%
    //console.log(slippageTolerance);
    //console.log(CurrencyAmount.ether(JSBI.BigInt(100)));
    //console.log(trade.minimumAmountOut(slippageTolerance));
    //return console.log(trade.minimumAmountOut(slippageTolerance));
    // Decimal values when converted to BigInt fail later in tx. Need to convert to Int
    let amountOutMin = parseInt(trade.minimumAmountOut(slippageTolerance).toExact()) // needs to be converted to e.g. hex
    
    amountOutMin = BigNumber.from(amountOutMin).toHexString()
    
    const path = [weth.address, dai.address]
    const to = receiverAddress // should be a checksummed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * max_trade_life // 20 minutes from the current Unix time
    const value = trade.inputAmount.toSignificant(6) // // needs to be converted to e.g. hex
    
    //console.log(trade.inputAmount);
    console.log(amountOutMin);

    // console.log("1 weth to dai: ", weth_to_dai);
    // console.log("1 dai to weth: ", dai_to_weth);
    // console.log("execution_price: ", execution_price);
    // console.log("nextMidPrice: ", nextMidPrice);
     console.log(value);

    // const provider = ethers.getDefaultProvider(network, {
    //     infura: "https://ropsten.infura.io/v3/eaf58e744a7b4555a054e920e76fad12"
    // });

    const provider = new ethers.providers.Web3Provider(window.ethereum)

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

    // console.log(amountOutMin);
    // console.log(path);
    // console.log(to);
    // console.log(deadline);
    // console.log(value);
    // console.log("gasPrice", 20e9);

    //return;
    let gasPrice = provider.getGasPrice();
    console.log(gasPrice);

    const tx = await uniswap.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        {value, gasPrice}
    )

    console.log('Tx Hash:', tx.hash);

    const receipt = await tx.wait();
    console.log(receipt.blockNumber);

}

//init();

function App() {
  return (
    <div className="App">
        <button onClick={()=>init()} >Click</button>
    </div>
  );
}

export default App;
