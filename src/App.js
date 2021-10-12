import './App.css';
import React, { useState, useEffect, useReducer, useCallback } from 'react';
import JSBI from 'jsbi/dist/jsbi.mjs';
const { ethers, BigNumber } = require("ethers");
const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType, Percent, CurrencyAmount } = require('@uniswap/sdk')

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const NETWORK = 'RINKEBY';

const UniswapV2Router02 = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const defiTokens = {
    "USDAO": {
        "name": "USDAO Stablecoin Test14",
        "address": "0x585fcE75fC4F4cC2943AAD3B7726962190441bA1",
        "decimals": 18,
        "abi": [
            {
                inputs: [
                    {
                        internalType: 'contract Oracle',
                        name: 'oracle_',
                        type: 'address'
                    },
                    {
                        internalType: 'address[]',
                        name: 'optedOut_',
                        type: 'address[]'
                    },
                    {
                        internalType: 'address',
                        name: '_timelockAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'address payable',
                        name: '_foundationAddress',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'minWithdrawalSeconds',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'constructor'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'owner',
                        type: 'address'
                    },
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'spender',
                        type: 'address'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'value',
                        type: 'uint256'
                    }
                ],
                name: 'Approval',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'adjustment',
                        type: 'uint256'
                    }
                ],
                name: 'BidAskAdjustmentChanged',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'user',
                        type: 'address'
                    },
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'delegate',
                        type: 'address'
                    },
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: 'enabled',
                        type: 'bool'
                    }
                ],
                name: 'Delegate',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_saveBurnFee',
                        type: 'uint256'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_saveDefundFee',
                        type: 'uint256'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_saveTaxFee',
                        type: 'uint256'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_saveUSDAOMintFee',
                        type: 'uint256'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: '_saveTransferFee',
                        type: 'uint256'
                    }
                ],
                name: 'Fees',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'user',
                        type: 'address'
                    },
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: 'newStatus',
                        type: 'bool'
                    }
                ],
                name: 'OptOutStatusChanged',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'previousOwner',
                        type: 'address'
                    },
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'newOwner',
                        type: 'address'
                    }
                ],
                name: 'OwnershipTransferred',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    }
                ],
                name: 'PriceChanged',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'from',
                        type: 'address'
                    },
                    {
                        indexed: true,
                        internalType: 'address',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        indexed: false,
                        internalType: 'uint256',
                        name: 'value',
                        type: 'uint256'
                    }
                ],
                name: 'Transfer',
                type: 'event'
            },
            {
                anonymous: false,
                inputs: [
                    {
                        indexed: false,
                        internalType: 'bool',
                        name: 'underwater',
                        type: 'bool'
                    }
                ],
                name: 'UnderwaterStatusChanged',
                type: 'event'
            },
            {
                inputs: [],
                name: 'BID_ASK_ADJUSTMENT_DECAY_PER_SECOND',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'BID_ASK_ADJUSTMENT_ZERO_OUT_PERIOD',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'BILLION',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'DELEGABLE_DOMAIN',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'DOMAIN_SEPARATOR',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'FOUR_WAD',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'HALF_BILLION',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'MAX_DEBT_RATIO',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'MINIMUM_DELAY',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'MIN_FUM_BUY_PRICE_DECAY_PER_SECOND',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'PERMIT_TYPEHASH',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'SIGNATURE_TYPEHASH',
                outputs: [
                    {
                        internalType: 'bytes32',
                        name: '',
                        type: 'bytes32'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'WAD',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'delegate',
                        type: 'address'
                    }
                ],
                name: 'addDelegate',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'delegate',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint8',
                        name: 'v',
                        type: 'uint8'
                    },
                    {
                        internalType: 'bytes32',
                        name: 'r',
                        type: 'bytes32'
                    },
                    {
                        internalType: 'bytes32',
                        name: 's',
                        type: 'bytes32'
                    }
                ],
                name: 'addDelegateBySignature',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'enum IUSM.Side',
                        name: 'side',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'adjustment',
                        type: 'uint256'
                    }
                ],
                name: 'adjustedEthUsdPrice',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'spender',
                        type: 'address'
                    }
                ],
                name: 'allowance',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'spender',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'wad',
                        type: 'uint256'
                    }
                ],
                name: 'approve',
                outputs: [
                    {
                        internalType: 'bool',
                        name: '',
                        type: 'bool'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'guy',
                        type: 'address'
                    }
                ],
                name: 'balanceOf',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'storedTime',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'storedAdjustment',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'currentTime',
                        type: 'uint256'
                    }
                ],
                name: 'bidAskAdjustment',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'adjustment',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [],
                name: 'bidAskAdjustment',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'adjustment',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'from',
                        type: 'address'
                    },
                    {
                        internalType: 'address payable',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmToBurn',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'minEthOut',
                        type: 'uint256'
                    }
                ],
                name: 'burn',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethOut',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'burnFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint8',
                        name: '_newburnFees',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint32',
                        name: '_base',
                        type: 'uint32'
                    }
                ],
                name: 'changeBurnFee',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint8',
                        name: '_newDefundFees',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint32',
                        name: '_base',
                        type: 'uint32'
                    }
                ],
                name: 'changeDefundFee',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint8',
                        name: '_newburnFees',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint32',
                        name: '_base',
                        type: 'uint32'
                    }
                ],
                name: 'changeMintFee',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint8',
                        name: '_newTax',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint32',
                        name: '_base',
                        type: 'uint32'
                    }
                ],
                name: 'changeTransactionTax',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint8',
                        name: '_newtransferFees',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint32',
                        name: '_base',
                        type: 'uint32'
                    }
                ],
                name: 'changeTransferFee',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'usmActualSupply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethPool_',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'oldTimeUnderwater',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'currentTime',
                        type: 'uint256'
                    }
                ],
                name: 'checkIfUnderwater',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'timeSystemWentUnderwater_',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmSupplyForFumBuys',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'debtRatio_',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethInPool',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmSupply',
                        type: 'uint256'
                    }
                ],
                name: 'debtRatio',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'ratio',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [],
                name: 'decimals',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'from',
                        type: 'address'
                    },
                    {
                        internalType: 'address payable',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'fumToBurn',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'minEthOut',
                        type: 'uint256'
                    }
                ],
                name: 'defund',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethOut',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'defundFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    }
                ],
                name: 'delegated',
                outputs: [
                    {
                        internalType: 'bool',
                        name: '',
                        type: 'bool'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethInPool',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmSupply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'bool',
                        name: 'roundUp',
                        type: 'bool'
                    }
                ],
                name: 'ethBuffer',
                outputs: [
                    {
                        internalType: 'int256',
                        name: 'buffer',
                        type: 'int256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'timeSystemWentUnderwater',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPriceTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPrice',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustmentTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustment',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethPool',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'usmTotalSupply',
                                type: 'uint256'
                            }
                        ],
                        internalType: 'struct IUSM.LoadedState',
                        name: 'ls',
                        type: 'tuple'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmIn',
                        type: 'uint256'
                    }
                ],
                name: 'ethFromBurn',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethOut',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'adjGrowthFactor',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'timeSystemWentUnderwater',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPriceTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPrice',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustmentTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustment',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethPool',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'usmTotalSupply',
                                type: 'uint256'
                            }
                        ],
                        internalType: 'struct IUSM.LoadedState',
                        name: 'ls',
                        type: 'tuple'
                    },
                    {
                        internalType: 'uint256',
                        name: 'fumSupply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'fumIn',
                        type: 'uint256'
                    }
                ],
                name: 'ethFromDefund',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethOut',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'adjShrinkFactor',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [],
                name: 'ethPool',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'pool',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethAmount',
                        type: 'uint256'
                    },
                    {
                        internalType: 'bool',
                        name: 'roundUp',
                        type: 'bool'
                    }
                ],
                name: 'ethToUsm',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'usmOut',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [],
                name: 'fum',
                outputs: [
                    {
                        internalType: 'contract FUM',
                        name: '',
                        type: 'address'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'timeSystemWentUnderwater',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPriceTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPrice',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustmentTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustment',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethPool',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'usmTotalSupply',
                                type: 'uint256'
                            }
                        ],
                        internalType: 'struct IUSM.LoadedState',
                        name: 'ls',
                        type: 'tuple'
                    },
                    {
                        internalType: 'uint256',
                        name: 'fumSupply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethIn',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'debtRatio_',
                        type: 'uint256'
                    }
                ],
                name: 'fumFromFund',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'fumOut',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'adjGrowthFactor',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'enum IUSM.Side',
                        name: 'side',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethInPool',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmEffectiveSupply',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'fumSupply',
                        type: 'uint256'
                    }
                ],
                name: 'fumPrice',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [],
                name: 'fumTotalSupply',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'supply',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'minFumOut',
                        type: 'uint256'
                    }
                ],
                name: 'fund',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'fumOut',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'payable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethAmount',
                        type: 'uint256'
                    }
                ],
                name: 'getBurnFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethAmount',
                        type: 'uint256'
                    }
                ],
                name: 'getDefundFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'tokenAmount',
                        type: 'uint256'
                    }
                ],
                name: 'getMintFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'tokenAmount',
                        type: 'uint256'
                    }
                ],
                name: 'getTaxFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'tokenAmount',
                        type: 'uint256'
                    }
                ],
                name: 'getTransferFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'latestPrice',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'updateTime',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'loadState',
                outputs: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'timeSystemWentUnderwater',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPriceTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPrice',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustmentTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustment',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethPool',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'usmTotalSupply',
                                type: 'uint256'
                            }
                        ],
                        internalType: 'struct IUSM.LoadedState',
                        name: 'ls',
                        type: 'tuple'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'to',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'minUsmOut',
                        type: 'uint256'
                    }
                ],
                name: 'mint',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'usmOut',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'payable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'mintFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'name',
                outputs: [
                    {
                        internalType: 'string',
                        name: '',
                        type: 'string'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    }
                ],
                name: 'nonces',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'optBackIn',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'optOut',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    }
                ],
                name: 'optedOut',
                outputs: [
                    {
                        internalType: 'bool',
                        name: '',
                        type: 'bool'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'oracle',
                outputs: [
                    {
                        internalType: 'contract Oracle',
                        name: '',
                        type: 'address'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'owner',
                outputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'owner',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'spender',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'amount',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'deadline',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint8',
                        name: 'v',
                        type: 'uint8'
                    },
                    {
                        internalType: 'bytes32',
                        name: 'r',
                        type: 'bytes32'
                    },
                    {
                        internalType: 'bytes32',
                        name: 's',
                        type: 'bytes32'
                    }
                ],
                name: 'permit',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'refreshPrice',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'updateTime',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'user',
                        type: 'address'
                    }
                ],
                name: 'renounceDelegate',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'renounceOwnership',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'revenueContract',
                outputs: [
                    {
                        internalType: 'contract Revenue',
                        name: '',
                        type: 'address'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'delegate',
                        type: 'address'
                    }
                ],
                name: 'revokeDelegate',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'saveBurnFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'saveDefundFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'saveTaxFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'saveTransferFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'saveUSDAOMintFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    }
                ],
                name: 'signatureCount',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'storedState',
                outputs: [
                    {
                        internalType: 'uint32',
                        name: 'timeSystemWentUnderwater',
                        type: 'uint32'
                    },
                    {
                        internalType: 'uint32',
                        name: 'ethUsdPriceTimestamp',
                        type: 'uint32'
                    },
                    {
                        internalType: 'uint80',
                        name: 'ethUsdPrice',
                        type: 'uint80'
                    },
                    {
                        internalType: 'uint32',
                        name: 'bidAskAdjustmentTimestamp',
                        type: 'uint32'
                    },
                    {
                        internalType: 'uint80',
                        name: 'bidAskAdjustment',
                        type: 'uint80'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'symbol',
                outputs: [
                    {
                        internalType: 'string',
                        name: '',
                        type: 'string'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'taxationContract',
                outputs: [
                    {
                        internalType: 'contract Taxation',
                        name: '',
                        type: 'address'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'timeSystemWentUnderwater',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'timestamp',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'timelockAddress',
                outputs: [
                    {
                        internalType: 'address',
                        name: '',
                        type: 'address'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'totalSupply',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [],
                name: 'transactionTax',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'dst',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'wad',
                        type: 'uint256'
                    }
                ],
                name: 'transfer',
                outputs: [
                    {
                        internalType: 'bool',
                        name: '',
                        type: 'bool'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [],
                name: 'transferFee',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'view',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'src',
                        type: 'address'
                    },
                    {
                        internalType: 'address',
                        name: 'dst',
                        type: 'address'
                    },
                    {
                        internalType: 'uint256',
                        name: 'wad',
                        type: 'uint256'
                    }
                ],
                name: 'transferFrom',
                outputs: [
                    {
                        internalType: 'bool',
                        name: '',
                        type: 'bool'
                    }
                ],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'address',
                        name: 'newOwner',
                        type: 'address'
                    }
                ],
                name: 'transferOwnership',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: 'uint256',
                                name: 'timeSystemWentUnderwater',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPriceTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethUsdPrice',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustmentTimestamp',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'bidAskAdjustment',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'ethPool',
                                type: 'uint256'
                            },
                            {
                                internalType: 'uint256',
                                name: 'usmTotalSupply',
                                type: 'uint256'
                            }
                        ],
                        internalType: 'struct IUSM.LoadedState',
                        name: 'ls',
                        type: 'tuple'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethIn',
                        type: 'uint256'
                    }
                ],
                name: 'usmFromMint',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'usmOut',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'adjShrinkFactor',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'enum IUSM.Side',
                        name: 'side',
                        type: 'uint8'
                    },
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    }
                ],
                name: 'usmPrice',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'price',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethUsdPrice',
                        type: 'uint256'
                    },
                    {
                        internalType: 'uint256',
                        name: 'usmAmount',
                        type: 'uint256'
                    },
                    {
                        internalType: 'bool',
                        name: 'roundUp',
                        type: 'bool'
                    }
                ],
                name: 'usmToEth',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: 'ethOut',
                        type: 'uint256'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [],
                name: 'version',
                outputs: [
                    {
                        internalType: 'string',
                        name: '',
                        type: 'string'
                    }
                ],
                stateMutability: 'pure',
                type: 'function'
            },
            {
                inputs: [
                    {
                        internalType: 'bool',
                        name: 'withdraw_mint_fee',
                        type: 'bool'
                    },
                    {
                        internalType: 'bool',
                        name: 'withdraw_burn_fee',
                        type: 'bool'
                    },
                    {
                        internalType: 'bool',
                        name: 'withdraw_fund_fee',
                        type: 'bool'
                    },
                    {
                        internalType: 'bool',
                        name: 'withdraw_defund_fee',
                        type: 'bool'
                    },
                    {
                        internalType: 'bool',
                        name: 'withdraw_transfer_fee',
                        type: 'bool'
                    }
                ],
                name: 'withdrawFee',
                outputs: [],
                stateMutability: 'nonpayable',
                type: 'function'
            },
            {
                stateMutability: 'payable',
                type: 'receive'
            }
        ],
    }
}

const WETH_TO_ERCTOKEN = async (INPUT_TOKEN = {}) => {

    if (typeof process.env.REACT_APP_USER_PRIVATE_KEY !== "string") {
        return console.error("env not set");
    }

    const USER_PRIVATE_KEY = Buffer.from(process.env.REACT_APP_USER_PRIVATE_KEY, 'hex');

    const receiverAddressWallet = new ethers.Wallet(process.env.REACT_APP_USER_PRIVATE_KEY);
    const receiverAddress  = receiverAddressWallet.address;
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

        const receiverAddressWallet = new ethers.Wallet(process.env.REACT_APP_USER_PRIVATE_KEY);
        const receiverAddress  = receiverAddressWallet.address;
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



        const abi = INPUT_TOKEN['abi'];
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
    //     setReceiverAddress(receiverAddress);

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
                            Uniswap: Buy USDAO for ETH (RINKEBY)
                      </div>
                        <div className="card-body">
                            <h5>Enter amount in Ether</h5>
                            <div className="input-group">
                                <input type="text" className="form-control"
                                    id="eth_amount"
                                    aria-label="Ether amount (with dot and two decimal places)" />
                                <button onClick={() => WETH_TO_ERCTOKEN(defiTokens["USDAO"])} className="btn btn-primary">ETH Amount</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-sm">

                </div>

                <div className="col-sm">
                    <div className="card">
                        <div className="card-header">
                            Uniswap: Buy ETH for USDAO (RINKEBY)
                      </div>
                        <div className="card-body">
                            <h5>Enter amount in ERCTokens</h5>
                            <div className="input-group">
                                <input type="text" className="form-control"
                                    id="ercToken_amount"
                                    aria-label="Amount (with dot and two decimal places)" />
                                <button onClick={() => ERCTOKEN_TO_WETH(defiTokens["USDAO"])} className="btn btn-primary">Token Amount</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>


        </div>
    );
}

export default App;
