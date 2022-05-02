import { useState, useContext } from 'react'
import { StateContext } from '../context'
import Carousel from 'react-elastic-carousel'
import EditForm from './EditForm'

export default function RecipeCard({recipe, onRemoveRecipe, onHandleView}) {
  const [editForm, setEditForm] = useState(false)
  const [isZoom, setZoom] = useState('false')
  const { viewing, setLoading, setRecipes } = useContext(StateContext)

  const breakPoints = [
    { width: 1, itemsToShow: 1 },
    { width: 550, itemsToShow: 2 },
    { width: 768, itemsToShow: 3 },
    { width: 1200, itemsToShow: 4 },
  ]

  const handleZoom = () => {
    setZoom(!isZoom)
  }

  return (
    <div className="recipe" key={recipe.id}>
      <h3>{recipe.title}</h3>

      <p dangerouslySetInnerHTML={{ __html: recipe.description }}></p>

      {viewing && (
        <div className="viewingCard">
          <div className="viewingCard">
            <div
              id="recipeImageCard"
              className={!recipe.images.length ? 'hidden' : 'imagesContainer'}
            >
              <div
                id="imagesWrapper"
                className={`recipeImage-${isZoom ? 'zoomed' : 'normal'}`}
              >
                <Carousel id="carousel" breakPoints={breakPoints}>
                  {recipe.images.map((imageUrl, i) => (
                    <img
                      onClick={handleZoom}
                      className="recipeImage"
                      key={i}
                      src={imageUrl}
                      alt="recipe-picture"
                    />
                  ))}
                </Carousel>
              </div>
            </div>

            <h4>Ingredients</h4>
            <ul>
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
              ))}
            </ul>

            <h4>Steps</h4>
            <ol>
              {recipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <div className="buttons">
        <button onClick={() => onHandleView(recipe.id)}>
          View {recipe.viewing ? 'less' : 'more'}{' '}
        </button>
        <button className="remove" onClick={() => onRemoveRecipe(recipe.id)}>
          Remove
        </button>
        <button className="edit" onClick={() => setEditForm(true)}>
          Edit
        </button>
      </div>
      {editForm && <EditForm recipe={recipe} setEditForm={setEditForm} />}
    </div>
  )
}
