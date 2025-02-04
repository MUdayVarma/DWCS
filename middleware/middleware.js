// Middleware to handle IoT data
const mqtt = require('mqtt');
const express = require('express');
const bodyParser = require("body-parser");
const { Web3 } = require('web3');
const crypto = require('crypto');
const { ethers } = require("ethers");

// MQTT Configuration
const mqttBroker = 'mqtt://test.mosquitto.org'; //'mqtt://mqtt.eclipse.org'
port = 1883
const mqttTopic = 'iot/sensor/data';

// Blockchain Configuration
const web3 = new Web3('http://127.0.0.1:7545'); // For GalancheCLI RPC URL //'http://localhost:8545'

//Account address to query
const accountAddress = '0xD684Ca38F299e7b950BA6821a8683BA782087eAE'; // Replace with your Ganache account address [1, 4, 7]

//Contract ABI
const contractABI = require('/Users/udayvarma/UdayWorkSpace/Projects/01PoCs/20250107_IoTMQQTBcNwDApp-02/artifacts/contracts/contractStWrFwDa.sol/StoreWaterFlowData_0107.json').abi; // Replace with ABI

//Contract Address
const contractAddress = '0xBc8c629d3fbFB8BC748EbEF88F8fc1B0897ef5b6'; // Replace with the deployed contract address

const contract = new web3.eth.Contract(contractABI, contractAddress);

////------------------------------------------------------------------
////Validate Contract Code on the Network:
//Look at the transactions to confirm the contract creation transaction and its address.
web3.eth.getBlock('latest').then((block) => {
  console.log('First Block Transaction#:', block.transactions);
});
//Use Web3.js to fetch and compare the contract code:
web3.eth.getCode(contractAddress).then((code) => {
  if (code === '0x') {
      console.error('Contract is NOT ON on port 7545 (Ganache-UI) for this address.');
  } else {
      console.log('Contract with the address: {',contractAddress,'} is on port 7545 (Ganache-UI)');//, code);
  }
});

////------------------------------------------------------------------
//// Private Key for Signing - Original Hex Raw formatted key
const EC = require('elliptic').ec;
const ec = new EC('secp256k1'); // Adjust the curve as needed
const privateKeyHex = '0x769470cd45115e1e2accc3a29f0ede69fa989ae589f01b288f64b368986b4c9a'; // Replace with your private key

////------------------------------------------------------------------
// MQTT Client
const client = mqtt.connect(mqttBroker);
client.on('connect', () => {
  console.log('Connected to MQTT Broker');
  client.subscribe(mqttTopic, () => console.log(`Subscribed to ${mqttTopic}`));
  //console.log('I am in MQTT CLient');
});
////------------------------------------------------------------------
//// Store Sensor Data in Blockchain
client.on('message', async (topic, message) => {

  //Get Balance from Ganache Blockchain account
  const balance = await web3.eth.getBalance(accountAddress);
  console.log('Account Balance$:', balance.toString());
  
  //Keep getting sensor data from IoT devices
  const sensorData = JSON.parse(message.toString());
  console.log('Parsed Sensor Data', sensorData);  
  // Format data
  const formattedData = {
    deviceId: sensorData.deviceId,
    value: sensorData.value,
    timestamp: Date.now()
    //timestamp: new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
  };

  // Signing Data with Private Key (Encryption)
  if (!privateKeyHex)
    console.log('Private key is missing or not loaded correctly!');
  else
    console.log('Private key exists');
  // Hash the data
  const hash = crypto.createHash('sha256').update(JSON.stringify(formattedData)).digest();
  // Create key pair
  const keyPair = ec.keyFromPrivate(privateKeyHex, 'hex');
  // Sign the data
  const signature = keyPair.sign(hash).toDER('hex'); // DER or hex format
  console.log(`ECC Signature: ${signature}`);

  //Look at the transactions address.
  web3.eth.getBlock('latest').then((block) => {
    console.log('Latest block Transaction#:', block.transactions);
    });

  // Send data to Blockchain
  try {
    const accounts = await web3.eth.getAccounts();
    //Estimate gas usage before sending transaction
    const gasEstimate = await contract.methods
    .storeData(
    formattedData.deviceId,
    formattedData.value,
    formattedData.timestamp,
    signature
    )
    .estimateGas({ from: accounts[0] });
    
    web3.eth.getBlock('latest').then((blockIn) => {
    console.log("Estimated Gas:", gasEstimate, 'for latest block Transaction#:', blockIn.transactions);
  });
    await contract.methods.storeData(formattedData.deviceId, formattedData.value, formattedData.timestamp, signature)
      .send({ from: accounts[0], gas: gasEstimate, // Increased gas limit e.g. 3M (3,000,000)
       });
    console.log('Data sent to blockchain:', formattedData);
  } catch (error) {
    console.error('Error sending data:', error);
  }

});

  // Fetch the stored data from the blockchain
  async function fetchStoredData() {
    try {
      const dataCount = await contract.methods.dataCount().call();
      console.log(`Total Data Entries: ${dataCount}`);
      for (let i = 0; i < dataCount; i++) {
        const data = await contract.methods.data(i).call();
        console.log(`Data Entry ${i}:`, data);
      }
  } catch (error) {
        console.error('Error fetching data:', error);
      }
  }

  fetchStoredData(); //*/


//// REST API for Health Check
const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.send('Middleware is running!');
});
//bash%: curl http://localhost:3001/health

app.post("/send-data", async (req, res) => {
  try {
    const { sensorId, value } = req.body;
    const tx = await contract.storeData(sensorId, value);
    await tx.wait();
    res.send("Data sent to blockchain!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error storing data.");
  }
});
app.listen(3001, () => console.log('Middleware API running on port 3001'));




/*****NEW DIFFERET MIDDLEWARE CODE... TO BE TRIED OUT
const app = express();
app.use(bodyParser.json());

//const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache
const provider = new Web3("http://127.0.0.1:7545"); // Ganache
const contractAddress = "0xBc8c629d3fbFB8BC748EbEF88F8fc1B0897ef5b6"; // Replace with deployed address
const contractABI = ["/Users/udayvarma/UdayWorkSpace/Projects/01PoCs/20250107_IoTMQQTBcNwDApp-02/artifacts/contracts/contractStWrFwDa.sol/StoreWaterFlowData_0107.json"]; // Replace with ABI
const privateKey = "0x769470cd45115e1e2accc3a29f0ede69fa989ae589f01b288f64b368986b4c9a"; // Replace with your wallet private key
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

app.post("/send-data", async (req, res) => {
  try {
    const { sensorId, value } = req.body;
    const tx = await contract.storeData(sensorId, value);
    await tx.wait();
    res.send("Data sent to blockchain!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error storing data.");
  }
});

app.listen(3001, () => console.log("Middleware running on port 3001"));

//FINISH: NEW DIFFERET MIDDLEWARE CODE... TO BE TRIED OUT*****/