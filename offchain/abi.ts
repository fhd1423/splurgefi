const abi = [
  {
    inputs: [
      { internalType: 'address', name: '_swapRouter', type: 'address' },
      { internalType: 'address', name: '_wethAddress', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'ECDSAInvalidSignature', type: 'error' },
  {
    inputs: [{ internalType: 'uint256', name: 'length', type: 'uint256' }],
    name: 'ECDSAInvalidSignatureLength',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 's', type: 'bytes32' }],
    name: 'ECDSAInvalidSignatureS',
    type: 'error',
  },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'inputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'outputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint8', name: 'tranches', type: 'uint8' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint8', name: 'salt', type: 'uint8' },
        ],
        internalType: 'struct SplurgeOrderStruct',
        name: '',
        type: 'tuple',
      },
      { internalType: 'bytes', name: '', type: 'bytes' },
    ],
    name: 'badSignature',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'feeTransferFailed',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'mustIncludeWETH',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'notEnoughBalanceToWithdraw',
    type: 'error',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'inputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'outputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint8', name: 'tranches', type: 'uint8' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint8', name: 'salt', type: 'uint8' },
        ],
        internalType: 'struct SplurgeOrderStruct',
        name: '',
        type: 'tuple',
      },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'tradeExpired',
    type: 'error',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'inputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'outputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint8', name: 'tranches', type: 'uint8' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint8', name: 'salt', type: 'uint8' },
        ],
        internalType: 'struct SplurgeOrderStruct',
        name: '',
        type: 'tuple',
      },
      { internalType: 'uint256', name: '', type: 'uint256' },
    ],
    name: 'tradesCompleted',
    type: 'error',
  },
  { stateMutability: 'payable', type: 'fallback' },
  {
    inputs: [],
    name: 'swapRouter',
    outputs: [
      { internalType: 'contract IZeroExSwap', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'tokenBalances',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes', name: '', type: 'bytes' }],
    name: 'tranchesCompleted',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'inputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'outputTokenAddy', type: 'address' },
          { internalType: 'address', name: 'recipient', type: 'address' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
          { internalType: 'uint8', name: 'tranches', type: 'uint8' },
          { internalType: 'uint256', name: 'deadline', type: 'uint256' },
          { internalType: 'uint8', name: 'salt', type: 'uint8' },
        ],
        internalType: 'struct SplurgeOrderStruct',
        name: 'order',
        type: 'tuple',
      },

      { internalType: 'bytes', name: 'signature', type: 'bytes' },

      {
        components: [
          { internalType: 'address', name: 'inputToken', type: 'address' },
          { internalType: 'address', name: 'outputToken', type: 'address' },
          {
            internalType: 'uint256',
            name: 'inputTokenAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'minOutputTokenAmount',
            type: 'uint256',
          },

          {
            components: [
              {
                internalType: 'uint32',
                name: 'deploymentNonce',
                type: 'uint32',
              },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            internalType: 'struct Transformation[]',
            name: 'transformations',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct ZeroExSwapStruct',
        name: 'swapCallData',
        type: 'tuple',
      },
    ],
    name: 'verifyExecuteTrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes', name: 'message', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'verifyTrade',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenToWithdraw', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'withdrawBalances',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

export default abi;
