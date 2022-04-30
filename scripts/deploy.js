const hre = require('hardhat')
const fs = require('fs')

async function main() {
  const SecretRecipe = await hre.ethers.getContractFactory('SecretRecipe')
  const secretRecipe = await SecretRecipe.deploy()
  await secretRecipe.deployed()
  console.log('SecretRecipe deployed to:', secretRecipe.address)

  fs.writeFileSync(
    './config.js',`
    export const contractAddress = "${secretRecipe.address}"
    export const ownerAddress = "${secretRecipe.signer.address}"
    `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })