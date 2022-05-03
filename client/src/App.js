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

import { css } from '@emotion/react'
import ClockLoader from 'react-spinners/ClockLoader'

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  display: block;
  margin: 4em auto;
  border-color: white;
`

const rpcUrl = 'https://rpc-mumbai.maticvigil.com'

function App() {
  const [whitelist, setWhitelist] = useState([])
  const [recipes, setRecipes] = useState([])
  const [authenticated, setAuthenticated] = useState(false)
  const [popupActive, setPopupActive] = useState(false)
  const [viewing, setViewing] = useState(false)
  const { isAuthenticated, authenticate, logout, isLoggingOut } = useMoralis()

  let [loading, setLoading] = useState(false)

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

  useEffect(() => {
    const fetchRecipes = async () => {
      const { ethereum } = window
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
          contractAddress,
          SecretRecipe.abi,
          signer
        )
        contract.on('RecipeEvent', async () => {
          const contractRecipes = await contract.getRecipes()
          contractRecipes.forEach(recipe => recipe.id.toNumber())
          setRecipes(contractRecipes)
          setLoading(false)
        })
      }
    }
    fetchRecipes()
  }, [])

  const connectWallet = async () => {
    let loggedUser = await authenticate({
      signingMessage: 'Sign in to Secret Sauce',
    })
    const address = await loggedUser.get('ethAddress')
    const formattedAddress = utils.getAddress(address)
    setLoading(true)
    if (whitelist.includes(formattedAddress)) {
      setAuthenticated(true)
      const provider = await Moralis.enableWeb3()
      const signer = provider.getSigner()
      const contract = new ethers.Contract( contractAddress, SecretRecipe.abi, signer )
      const contractRecipes = await contract.getRecipes()
      setRecipes(contractRecipes)
      setLoading(false)
    }
  }

  const removeRecipe = async (id) => {
    const provider = await Moralis.enableWeb3()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, SecretRecipe.abi, signer)
    await contract.deleteRecipe(id)
    setLoading(true)
  }

  const handleLogout = async () => {
    logout()
    setAuthenticated(false)
  }

  return (
    <StateContext.Provider
      value={{ setLoading, loading, setPopupActive, popupActive, setRecipes, recipes, setViewing, viewing }}
    >
      <div className="App">
        {!authenticated && (
          <div className="auth-btn">
            <button onClick={connectWallet}>Authenticate</button>
            {/* <ConnectButton signingMessage="Sign in to Secret Sauce" onClick={connectWallet} /> */}
          </div>
        )}
        {authenticated && isAuthenticated && (
          <div>
            
              <div className="logout-btn-container">
                <button
                className="logout-btn"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                Logout
              </button>
            </div>

            <div className="logo-container">
              <h1 id="logo-text">
                Secret Sauce
              </h1>
            </div>
            
            
            <div className="top-btns-container">
              <button
                onClick={() => setPopupActive(!popupActive)}
                disabled={loading}
                className="add-recipe-btn"
              >
                Add recipe
              </button>
            </div>

            <div className="sweet-loading">
              <ClockLoader
                color={'#ffffff'}
                loading={loading}
                css={override}
                size={150}
              />
            </div>

            <div className="recipes">
              {!loading &&
                recipes.map((recipe, i) => (
                  <RecipeCard
                    className="recipeCard"
                    key={i}
                    recipe={recipe}
                    onRemoveRecipe={removeRecipe}
                  />
                ))}
            </div>
            {popupActive && <Form />}
          </div>
        )}
      </div>
    </StateContext.Provider>
  )
}

export default App
