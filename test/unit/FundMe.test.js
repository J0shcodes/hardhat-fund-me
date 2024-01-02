const { deployments, getNamedAccounts, ethers } = require("hardhat")
const { assert, expect } = require("chai")
const {deploymentChains} = require("../../helper-hardhat-config")

!deploymentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          // let deployer
          let mockV3Aggregator
          let signer
          const sendValue = ethers.parseEther("1")

          before(async function () {
              const accounts = await ethers.getSigners()
              signer = accounts[0]
              // deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])

              const fundMeDeployment = await deployments.get("FundMe")
              fundMe = await ethers.getContractAt(
                  fundMeDeployment.abi,
                  fundMeDeployment.address,
                  signer
              )
              const mockV3AggregatorDeployment = await deployments.get(
                  "MockV3Aggregator"
              )
              mockV3Aggregator = await ethers.getContractAt(
                  mockV3AggregatorDeployment.abi,
                  mockV3AggregatorDeployment.address,
                  signer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })

          describe("fund", async function () {
              it("fails if you don't send enough ETH", async function () {
                  expect(fundMe.fund()).to.be.rejectedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("update the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAmountFunded(signer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("add funders to array of funders", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, signer.address)
              })
          })

          describe("withdraw", async function () {
              before(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw funds from a single funder", async function () {
                  // Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(signer.address)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(signer.address)

                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingFundMeBalance + startingDeployerBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )
              })

              it("allows us to withdraw from multiple funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(
                          await fundMe.getAddress()
                      )
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(signer.address)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionReceipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      await fundMe.getAddress()
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(signer.address)

                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      (
                          startingDeployerBalance + startingFundMeBalance
                      ).toString(),
                      (endingDeployerBalance + gasCost).toString()
                  )

                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAmountFunded(accounts[i].address),
                          0
                      )
                  }
              })

              it("only allows owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
              })
          })
      })
