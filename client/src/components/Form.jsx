import { useState } from 'react'
import { useMoralisFile } from 'react-moralis'
import { ethers, utils } from 'ethers'
import Moralis from 'moralis'

import SecretRecipe from '../ContractABI.json'
import { contractAddress } from '../config'

export default function Form({ setPopupActive, ethAddress, rpcUrl }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    ingredients: [],
    steps: [],
    images: [],
  })
  const [images, setImages] = useState([])
  const [progress, setProgress] = useState(0)
  const { saveFile } = useMoralisFile()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.ingredients || !form.steps) {
      alert('Please fill out all the fields')
      return
    }
    
    const provider = await Moralis.enableWeb3();
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, SecretRecipe.abi, signer)
    await contract.addRecipe(form)

    setForm({
      title: '',
      description: '',
      link: '',
      ingredients: [],
      steps: [],
      images: [],
    })
    setPopupActive(false)
  }
  const handleIngredient = (e, i) => {
    const ingredientsClone = [...form.ingredients]

    ingredientsClone[i] = e.target.value
    setForm({ ...form, ingredients: ingredientsClone })
  }

  const handleStep = (e, i) => {
    const stepsClone = [...form.steps]

    stepsClone[i] = e.target.value
    setForm({ ...form, steps: stepsClone })
  }

  const handleIngredientCount = () => {
    setForm({ ...form, ingredients: [...form.ingredients, ''] })
  }
  const handleStepCount = () => {
    setForm({ ...form, steps: [...form.steps, ''] })
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
    for (const image of images) {
      await saveFile(image.name, image, {
      saveIPFS: true,
      onSuccess: async (file) => {
        urls.push(file._ipfs)
      }
    })
    }
    setForm({ ...form, images: [...form.images, urls] })
  }
  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Add a new recipe</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Ingredients</label>
            {form.ingredients.map((ingredient, i) => (
              <input
                type="text"
                key={i}
                value={ingredient}
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
            {form.steps.map((step, i) => (
              <textarea
                type="text"
                key={i}
                value={step}
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
            <button type="submit">Submit</button>
            <button
              type="button"
              className="remove"
              onClick={() => setPopupActive(false)}
            >
              {' '}
              Close{' '}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
