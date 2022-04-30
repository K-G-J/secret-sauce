import './App.css'
import { ethers } from 'ethers'
import { useMoralis } from 'react-moralis'
import { useState, useEffect } from 'react'

import SecretRecipe from './ContractABI.json'

function App() {
  const contractAddress = "0xd7C18b68692c4D0f97434CDABB2C781EffdcA7a2"
  const [whitelist, setWhitelist] = useState([])
  const [authenticated, setAuthenticated] = useState(false)
  const {
    authenticate,
    user,
    logout,
    isLoggingOut,
  } = useMoralis()

  useEffect(() => {
    loadRecipes()
  }, [])

  async function loadRecipes() {
    const provider = new ethers.providers.JsonRpcProvider( 'https://rpc-mumbai.maticvigil.com', )
    const contract = new ethers.Contract(contractAddress, SecretRecipe.abi, provider)
    const whitelist = await contract.getPermitted()
    setWhitelist(whitelist)
  }

  const connectWallet = async () => {
    authenticate({
      signingMessage: 'Sign in to Secret Sauce',
    })
    const address = await user.get('ethAddress')
    console.log(address)
    console.log(whitelist)
    if (whitelist.includes(address)) {
      setAuthenticated(true)
      console.log(authenticated)
    }
  }

  return (
    <div className="App">
      <div className="auth-btn">
        <button onClick={connectWallet}>Authenticate</button>
      </div>
    </div>
  )
}

export default App
