const { expect } = require('chai')
const { ethers } = require('hardhat')
const { utils } = require('ethers')

describe('SecretRecipe', async function () {
  it('Should create a recipe', async function () {
    const SecretRecipe = await ethers.getContractFactory('SecretRecipe')
    const secretRecipe = await SecretRecipe.deploy()
    await secretRecipe.deployed()
    await secretRecipe.addRecipe(
      'Test Title',
      'This is a test decription',
      ['ingredient1', 'ingredient2', 'ingredient3'],
      ['step1', 'step2', 'step3'],
      ['image1', 'image2', 'image3'],
    )

    const recipes = await secretRecipe.getRecipes()
    expect(recipes[0].title).to.equal('Test Title')
    expect(recipes[0].description).to.equal('This is a test decription')
    expect(recipes[0].ingredients).to.eql([
      'ingredient1',
      'ingredient2',
      'ingredient3',
    ])
    expect(recipes[0].steps).to.eql(['step1', 'step2', 'step3'])
    expect(recipes[0].images).to.eql(['image1', 'image2', 'image3'])
  })

  it('Should edit a recipe', async function () {
    const SecretRecipe = await ethers.getContractFactory('SecretRecipe')
    const secretRecipe = await SecretRecipe.deploy()
    await secretRecipe.deployed()
    await secretRecipe.addRecipe(
      'Test Title',
      'This is a test decription',
      ['ingredient1', 'ingredient2', 'ingredient3'],
      ['step1', 'step2', 'step3'],
      ['image1', 'image2', 'image3'],
    )

    await secretRecipe.editRecipe(
      1,
      'Changed Title',
      'This is a changed test decription',
      ['ingredient4', 'ingredient5', 'ingredient6'],
      ['step4', 'step5', 'step6'],
      ['image4', 'image5', 'image6'],
    )

    const recipes = await secretRecipe.getRecipes()
    expect(recipes[0].title).to.equal('Changed Title')
    expect(recipes[0].description).to.equal('This is a changed test decription')
    expect(recipes[0].ingredients).to.eql([
      'ingredient4',
      'ingredient5',
      'ingredient6',
    ])
    expect(recipes[0].steps).to.eql(['step4', 'step5', 'step6'])
    expect(recipes[0].images).to.eql(['image4', 'image5', 'image6'])
  })

  it('Should delete a recipe', async function () {
    const SecretRecipe = await ethers.getContractFactory('SecretRecipe')
    const secretRecipe = await SecretRecipe.deploy()
    await secretRecipe.deployed()
    await secretRecipe.addRecipe(
      'Test Title',
      'This is a test decription',
      ['ingredient1', 'ingredient2', 'ingredient3'],
      ['step1', 'step2', 'step3'],
      ['image1', 'image2', 'image3'],
    )

    await secretRecipe.deleteRecipe(1)

    const recipes = await secretRecipe.getRecipes()
    expect(recipes.length).to.equal(0)
  })

  it('Should add a permitted address', async function () {
    const SecretRecipe = await ethers.getContractFactory('SecretRecipe')
    const secretRecipe = await SecretRecipe.deploy()
    await secretRecipe.deployed()
    const owner = await secretRecipe.owner()
    const addedAdress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
    await secretRecipe.addPermitted(addedAdress)
    const formattedAdded = utils.getAddress(addedAdress)
    const whitelist = await secretRecipe.getPermitted()
    expect(whitelist.length).to.equal(2)
    expect(whitelist[0]).to.equal(owner)
    expect(whitelist[1]).to.equal(formattedAdded)
  })

  it('Should delete a permitted address', async function () {
    const SecretRecipe = await ethers.getContractFactory('SecretRecipe')
    const secretRecipe = await SecretRecipe.deploy()
    await secretRecipe.deployed()
    const owner = await secretRecipe.owner()
    const addedAdress = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
    await secretRecipe.removePermitted(addedAdress)
    const whitelist = await secretRecipe.getPermitted()
    expect(whitelist.length).to.equal(1)
    expect(whitelist[0]).to.equal(owner)
  })
})
