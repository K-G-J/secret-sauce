require("@nomiclabs/hardhat-waffle");
const fs = require('fs');
// const alchemyId = fs.readFileSync(".alchemyid").toString().trim() || "toY4oMSX2GqYt9Ed_U87qq2Nteyjc4Xp";
const privateKey = fs.readFileSync(".secret").toString().trim()

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mumbai: {
      // Alchemy
      // url: `https://polygon-mumbai.g.alchemy.com/v2/${alchemyId}`
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [privateKey]
    },
    matic: {
      // Alchemy
      // url: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyId}`,
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey]
    }
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};