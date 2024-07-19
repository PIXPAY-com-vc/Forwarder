const { ethers } = require("ethers");
require('dotenv').config();
const { format } = require('date-fns');

const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const walletPrivateKey = process.env.RECEIVING_WALLET_PRIVATE_KEY;
const hotPrivateKey = process.env.HOT_WALLET_PRIVATE_KEY;

const wallet = new ethers.Wallet(walletPrivateKey, provider);
const hotWallet = new ethers.Wallet(hotPrivateKey, provider);

const usdtAddress = process.env.USDT_ADDRESS;
const usdtAbi = [
  'function name() public view returns (string)',
  'function symbol() public view returns (string)',
  'function decimals() public view returns (uint8)',
  'function totalSupply() public view returns (uint256)',
  'function balanceOf(address _owner) public view returns (uint256 balance)',
  'function transfer(address _to, uint256 _value) public returns (bool success)',
  'function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)',
  'function approve(address _spender, uint256 _value) public returns (bool success)',
  'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

const usdtContract = new ethers.Contract(usdtAddress, usdtAbi, provider);

const currentTimeFormatted = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

async function sendMatic(to, amount) {
  try {
    console.log(`Preparing to send ${amount} MATIC to ${to}`);
    const tx = await hotWallet.sendTransaction({
      to,
      value: ethers.utils.parseEther(amount),
      gasLimit: ethers.utils.hexlify(21000), // Adjust if necessary
      gasPrice: ethers.utils.parseUnits('350', 'gwei') // Adjust if necessary
    });
    console.log(`Transaction hash: ${tx.hash}`);
    console.log('Waiting for transaction to be mined...');
    const receipt = await tx.wait();
    console.log(`Transaction mined in block ${receipt.blockNumber}`);
    console.log(`Sent ${amount} MATIC to ${to}`);
  } catch (error) {
    console.error('Error sending MATIC:', error);
  }
}

async function forwardUSDT(to, amount) {

  const data =
    iface.encodeFunctionData('transfer', [
      to,
      amount
    ]);

  // Run function contract
  const tx = await wallet.sendTransaction({
    to: to,
    value: 0,
    gasLimit: 800000, // Set your custom gas limit here
    gasPrice: ethers.utils.parseUnits("350", 'gwei'), // Convert to BigNumber
    data: data
  });

  const receipt = await tx.wait();
  console.log(`Transaction mined in block ${receipt.blockNumber}`);
  console.log(`Forwarded ${ethers.utils.formatUnits(amount, 6)} USDT to ${to}`);
}

let iface = new ethers.utils.Interface(usdtAbi);

// Event handling logic
const handleEvent = async (event, transactionHash) => {
  console.log(`---------------------------------------------------------------------`);
  console.log('handling new event');

  const { args } = event;
  const from = args[0];
  const to = args[1];
  const value = args[2];

  console.log("FROM : ", from);
  console.log("TO : ", to);
  console.log("VALUE : ", ethers.utils.formatUnits(value, 6));


  try {
    console.log('Event TxHash:', transactionHash); // Log event data

    // Add logic to get your user info based on [to] wallet
    // Example: const user = await getUserByWallet(to);

    // Add logic to update user balance and perform any other actions in your database
    // Example: await updateUserBalance(user.id, ethers.utils.formatUnits(value, 6));


    // Send Matic to the receiving wallet from hot wallet          
    await sendMatic(to, "0.03");

    // Send the USDT from the receiving wallet to the hot wallet
    await forwardUSDT(hotWallet.address, value);

  } catch (error) {
    console.error('Error handling event:', error);
  }

}

// Listen for events from your smart contract
const startEventListening = async () => {

  console.log(`Beggining listening to events at ${currentTimeFormatted}`);

  const filter = {
    address: usdtContract.address, // Contract address
    topics: [
      ethers.utils.id('Transfer(address,address,uint256)'), // Event signature
      null, // Indexed parameter (from)
      ethers.utils.hexZeroPad(wallet.address, 32), // Indexed parameter (to)
      null
    ]
  };

  // Listen for events matching the filter
  usdtContract.provider.on(filter, (log) => {
    const event = usdtContract.interface.parseLog(log);
    console.log('Transfer event detected on address:', event);

    // Access the transaction hash from the event object
    const transactionHash = log.transactionHash;

    // Handle the event
    handleEvent(event, transactionHash);
  })
};

// Start listening for events
startEventListening().catch(console.error);
