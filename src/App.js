import './App.css';
import React, {useState, useEffect, useReducer, useCallback} from 'react';
import JSBI from 'jsbi/dist/jsbi.mjs';
const { ethers, BigNumber } = require("ethers");
const {ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent, CurrencyAmount} = require('@uniswap/sdk')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const init = async() => {
    
    if(typeof process.env.REACT_APP_USER_PRIVATE_KEY !=="string") {
        return console.error("env not set");
    }
    
    const USER_PRIVATE_KEY = Buffer.from(process.env.REACT_APP_USER_PRIVATE_KEY, 'hex');

    const network = 'ROPSTEN';
    
    const defiTokens = {
        "DAI": "0xad6d458402f60fd3bd25163575031acdce07538d"
    }
    
    const receiverAddress = process.env.REACT_APP_USER_ETH_ADDRESS;
    console.log(receiverAddress);
    let tradeAmount = Number(document.getElementById('eth_amount').value);

    if(tradeAmount <= 0) {
        alert("Invalid amount entered");
        return false;
    }

    tradeAmount = tradeAmount.toString();
    console.log(tradeAmount);
    
    const chainId = ChainId[network];
    
    
    const tokenAddress = defiTokens["DAI"];
    let max_trade_life = 20;
    
    const dai = await Fetcher.fetchTokenData(chainId, tokenAddress)
    const weth = WETH[chainId]
    const pair = await Fetcher.fetchPairData(dai, weth)
    const route = new Route([pair], weth)
    // Convert input amount in wei
    const tradeAmountWei = ethers.utils.parseEther(tradeAmount);
    console.log(tradeAmountWei);
    const tradeAmountBN = new TokenAmount(weth, JSBI.BigInt(tradeAmountWei));
    
    //console.log(tradeAmountBN);
    const trade = new Trade(route, tradeAmountBN, TradeType.EXACT_INPUT)
    console.log(trade.inputAmount.toExact());
  
    //console.log(trade.execution_price);
    const weth_to_dai = route.midPrice.toSignificant(6)
    const dai_to_weth = route.midPrice.invert().toSignificant(6)
    const execution_price = trade.executionPrice.toSignificant(6)
    const nextMidPrice = trade.nextMidPrice.toSignificant(6)
    const slippageTolerance = new Percent('50', '10000') // 50 bips, or 0.50%
    // Decimal values when converted to BigInt fail later in tx. Need to convert to Int
    let amountOutMin = parseInt(trade.minimumAmountOut(slippageTolerance).toExact()) // needs to be converted to e.g. hex
    
    amountOutMin = BigNumber.from(amountOutMin).toHexString()
    

    let proceed_to_trade = window.confirm(`You will get ${weth_to_dai*tradeAmount} Dai after the trade. Proceed?`);
    if(!proceed_to_trade) return false;

    const path = [weth.address, dai.address]
    const to = receiverAddress // should be a checksummed recipient address
    const deadline = Math.floor(Date.now() / 1000) + 60 * max_trade_life // 20 minutes from the current Unix time
    
    // Convert input amount back to wei
    const value = tradeAmountWei._hex // // needs to be converted to e.g. hex
    
    console.log("1 weth to dai: ", weth_to_dai);
    console.log("1 dai to weth: ", dai_to_weth);
    console.log("execution_price: ", execution_price);
    console.log("nextMidPrice: ", nextMidPrice);

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
    let gasPrice = await provider.getGasPrice();
    console.log(gasPrice._hex);
    console.log(value);

    console.log(amountOutMin);
    console.log(to);
    console.log(path);

    const tx = await uniswap.swapExactETHForTokens(
        amountOutMin,
        path,
        to,
        deadline,
        {value, gasPrice:gasPrice._hex}
    )

    console.log('Tx Hash:', tx.hash);
    alert(`Tx successful. Please visit ${network} network block explorer to see tx: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(receipt.blockNumber);

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

              </div>
              <div className="col-sm">
                  <div className="card">
                      <div className="card-header">
                            Uniswap: Buy DAI for ETH (ROPSTEN)
                      </div>
                      <div className="card-body">
                           <h5>Enter amount in Ether</h5> 
                           <div className="input-group">
                                <input type="text" className="form-control" 
                                id = "eth_amount"
                                aria-label="Ether amount (with dot and two decimal places)"/>
                                <button onClick={()=>init()} className="btn btn-primary">ETH Amount</button>
                            </div>
                      </div>
                  </div>
              </div>
              <div className="col-sm">

              </div>
          </div>

        
    </div>
  );
}

export default App;
