import './App.css'
import RecipeCard from './components/RecipeCard'
import Form from './components/Form.jsx'
import { ethers, utils } from 'ethers'
import { useMoralis } from 'react-moralis'
import { useState, useEffect } from 'react'
import { StateContext } from './context'

import SecretRecipe from './ContractABI.json'
import { contractAddress } from './config'
import Moralis from 'moralis'
// import { ConnectButton } from 'web3uikit'

import { css } from "@emotion/react";
import ClockLoader from "react-spinners/ClockLoader";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 4em auto;
  border-color: white;
`;

const rpcUrl = 'https://rpc-mumbai.maticvigil.com'

function App() {
  const [whitelist, setWhitelist] = useState([])
  const [recipes, setRecipes] = useState([])
  const [authenticated, setAuthenticated] = useState(false)
  const [popupActive, setPopupActive] = useState(false)
  const [viewing, setViewing] = useState(false)
  const { isAuthenticated, authenticate, user, logout, isLoggingOut } = useMoralis()

  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");


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
    if (whitelist.includes(formattedAddress)) {
      setAuthenticated(true)
      const provider = await Moralis.enableWeb3()
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddress, SecretRecipe.abi, signer)
      let contractRecipes = await contract.getRecipes()
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
        setViewing(!viewing)
      } else {
        setViewing(false)
      }
    })

    setRecipes(recipesClone)
  }

  const removeRecipe = async (id) => {
    const provider = await Moralis.enableWeb3()
    const signer = provider.getSigner()
    const contract = new ethers.Contract( contractAddress, SecretRecipe.abi, signer )
    const transaction = await contract.deleteRecipe(id)
    setLoading(true)
    await transaction.wait()
    let contractRecipes = await contract.getRecipes()
    setRecipes(contractRecipes)
    setLoading(false)
  }

  return (
    <StateContext.Provider value={{setLoading, loading, setPopupActive, popupActive, setRecipes, recipes, setViewing, viewing }}>
    <div className="App">
      {!authenticated && (
        <div className="auth-btn">
          <button onClick={connectWallet}>Authenticate</button>
          {/* <ConnectButton signingMessage="Sign in to Secret Sauce" onClick={connectWallet} /> */}
        </div>
      )}
      {authenticated && isAuthenticated && (
        <div>
          <div className="logo-container">
            <h1 onClick={refresh} id="logo-text">
              Secret Sauce
            </h1>
          </div>
          <button onClick={() => setPopupActive(!popupActive)} disabled={loading}>
            Add recipe
          </button>
          
          <div className="sweet-loading">
          <ClockLoader color={color} loading={loading} css={override} size={150} />
          </div>

        <div className="recipes">
            { !loading && recipes.map((recipe, i) => (
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
            <Form />
          )}
        </div>
      )}
      </div>
    </StateContext.Provider>
  )
}

export default App
