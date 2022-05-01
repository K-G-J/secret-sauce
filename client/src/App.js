import './App.css'
import RecipeCard from './components/RecipeCard'
import Form from './components/Form.jsx'
import { ethers, utils } from 'ethers'
import { useMoralis } from 'react-moralis'
import { useState, useEffect } from 'react'

import SecretRecipe from './ContractABI.json'
import { contractAddress } from './config'
import Moralis from 'moralis'

const rpcUrl = 'https://rpc-mumbai.maticvigil.com'

function App() {
  const [whitelist, setWhitelist] = useState([])
  const [recipes, setRecipes] = useState([])
  const [authenticated, setAuthenticated] = useState(false)
  const [ethAddress, setEthAddress] = useState(null)
  const [popupActive, setPopupActive] = useState(false)
  const {
    isAuthenticated,
    authenticate,
    user,
    logout,
    isLoggingOut,
  } = useMoralis()

  useEffect(() => {
    async function loadWhitelist() {
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
      const contract = new ethers.Contract(
        contractAddress,
        SecretRecipe.abi,
        provider,
      )
      const contractWhitelist = await contract.getPermitted()
      setWhitelist(contractWhitelist)
    }
    loadWhitelist()
  }, [])

  const connectWallet = async () => {
    authenticate({
      signingMessage: 'Sign in to Secret Sauce',
    })
    const address = user.get('ethAddress')
    const formattedAddress = utils.getAddress(address)
    setEthAddress(formattedAddress)
    if (whitelist.includes(formattedAddress)) {
      setAuthenticated(true)
      const provider = await Moralis.enableWeb3()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, SecretRecipe.abi, signer)
      const contractRecipes = await contract.getRecipes()
      setRecipes(contractRecipes)
    }
  }

  const refresh = () => {
    window.location.reload()
  }

  const handleView = (id) => {
    const recipesClone = [...recipes]

    recipesClone.forEach((recipe) => {
      if (recipe.id === id) {
        recipe.viewing = !recipe.viewing
      } else {
        recipe.viewing = false
      }
    })

    setRecipes(recipesClone)
  }

  const removeRecipe = async (id) => {
    const provider = await Moralis.enableWeb3()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(
      contractAddress,
      SecretRecipe.abi,
      signer,
    )
    await contract.deleteRecipe(id)
  }

  return (
    <div className="App">
      {!authenticated && (
        <div className="auth-btn">
          <button onClick={connectWallet}>Authenticate</button>
        </div>
      )}
      {authenticated && isAuthenticated && (
        <div>
          <div className="logo-container">
            <h1 onClick={refresh} id="logo-text">
              Secret Sauce
            </h1>
          </div>
          <button onClick={() => setPopupActive(!popupActive)}>
            Add recipe
          </button>
          <div className="recipes">
            {recipes.map((recipe, i) => (
              <RecipeCard
                className="recipeCard"
                key={i}
                recipe={recipe}
                onHandleView={handleView}
                onRemoveRecipe={removeRecipe}
              />
            ))}
          </div>
          {popupActive && (
            <Form setPopupActive={setPopupActive} ethAddress={ethAddress} />
          )}
        </div>
      )}
    </div>
  )
}

export default App
