import { useState, useContext } from 'react'
import { StateContext } from '../context'
import { useMoralisFile } from 'react-moralis'
import { ethers } from 'ethers'
import Moralis from 'moralis'

import SecretRecipe from '../ContractABI.json'
import { contractAddress } from '../config'

export default function EditForm({ recipe, setEditForm }) {
  const { setLoading, setRecipes } = useContext(StateContext)

  const recipeClone = { ...recipe }
  const { saveFile } = useMoralisFile()

  const [updatedRecipe, updateRecipe] = useState({
    title: recipeClone.title,
    description: recipeClone.description,
    ingredients: recipeClone.ingredients,
    steps: recipeClone.steps,
    images: recipeClone.images,
  })

  const [images, setImages] = useState([])
  const [progress, setProgress] = useState(0)

  const handleUpdate = async (e, id) => {
    e.preventDefault()
    if (!updatedRecipe.title || !updatedRecipe.description || !updatedRecipe.ingredients || !updatedRecipe.steps) {
      alert('Please fill out all the fields')
      return
    }
    const provider = await Moralis.enableWeb3()
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, SecretRecipe.abi, signer)
    const transaction = await contract.editRecipe(id, updatedRecipe.title, updatedRecipe.description, updatedRecipe.ingredients, updatedRecipe.steps, updatedRecipe.images)

    updateRecipe({
      title: '',
      description: '',
      ingredients: [],
      steps: [],
      images: [],
    })
    setEditForm(false);
    setLoading(true)
    await transaction.wait()
    let contractRecipes = await contract.getRecipes()
    setRecipes(contractRecipes)
    setLoading(false)
  }

  const handleIngredient = (e, i) => {
    const ingredientsClone = [...updatedRecipe.ingredients]

    ingredientsClone[i] = e.target.value
    updateRecipe({ ...updatedRecipe, ingredients: ingredientsClone })
  }
  const handleStep = (e, i) => {
    const stepsClone = [...updatedRecipe.steps]
    stepsClone[i] = e.target.value

    updateRecipe({ ...updatedRecipe, steps: stepsClone })
  }
  const handleIngredientCount = () => {
    updateRecipe({
      ...updatedRecipe,
      ingredients: [...updatedRecipe.ingredients, ''],
    })
  }
  const handleStepCount = () => {
    updateRecipe({ ...updatedRecipe, steps: [...updatedRecipe.steps, ''] })
  }
  const handleChange = (e) => {
    for (let i = 0; i < e.target.files.length; i++) {
      const newImage = e.target.files[i]
      newImage.id = Math.random()
      setImages((prevState) => [...prevState, newImage])
    }
  }
  const handleImages = async () => {
    const urls = []
    for (let i = 0; i < images.length; i++) {
      await saveFile(images[i].name, images[i], {
        saveIPFS: true,
        onSuccess: async (file) => {
          urls.push(file._ipfs)
          let uploadProgress = ((100 / images.length) * (i + 1))
          setProgress(uploadProgress)
        },
      })
    }
    updateRecipe({ ...updatedRecipe, images: urls })
  }

  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Edit Recipe</h2>

        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              defaultValue={recipeClone.title}
              onChange={(e) =>
                updateRecipe({ ...updatedRecipe, title: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              type="text"
              defaultValue={recipeClone.description}
              onChange={(e) =>
                updateRecipe({ ...updatedRecipe, description: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            {updatedRecipe.ingredients.map((ingredient, i) => (
              <input
                type="text"
                key={i}
                defaultValue={ingredient}
                onChange={(e) => handleIngredient(e, i)}
              />
            ))}
            <button type="button" onClick={handleIngredientCount}>
              {' '}
              Add ingredient{' '}
            </button>
          </div>

          <div className="form-group">
            <label>Steps</label>
            {updatedRecipe.steps.map((step, i) => (
              <textarea
                type="text"
                key={i}
                defaultValue={step}
                onChange={(e) => handleStep(e, i)}
              />
            ))}
            <button type="button" onClick={handleStepCount}>
              {' '}
              Add step{' '}
            </button>
          </div>

          <div className="form-group">
            <progress value={progress} max="100" />
            <br />
            <br />
            <label htmlFor="file-upload" className="custom-file-upload">
              Browse
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleChange}
            />
            <button type="button" onClick={handleImages}>
              {' '}
              Click to upload pics
            </button>
          </div>

          <div className="buttons">
            <button
              type="submit"
              onClick={(e) => handleUpdate(e, recipeClone.id)}
            >
              Submit
            </button>
            <button
              type="button"
              className="remove"
              onClick={() => setEditForm(false)}
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
