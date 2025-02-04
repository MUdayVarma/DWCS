/** @type import('hardhat/config').HardhatUserConfig */

require("@nomicfoundation/hardhat-ethers");

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC URL
      accounts: [
        "0x769470cd45115e1e2accc3a29f0ede69fa989ae589f01b288f64b368986b4c9a", // Add private keys from Ganache UI
        "0x0942b608dd5639da8a8a4e22cd743493f981824ccaa684fafed1eb3094fa6e2d",
      ],
    },
  },
};
