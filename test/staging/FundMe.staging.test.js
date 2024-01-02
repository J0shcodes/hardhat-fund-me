const { deployments, ethers, network } = require("hardhat")
const { deploymentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

deploymentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let signer
          const sendValue = ethers.parseEther("1")

          beforeEach(async function () {
              const accounts = await ethers.getSigner()
              signer = accounts[0]

              const fundMeDeployment = await deployments.get("FundMe")
              fundMe = await ethers.getContractAt(
                  fundMeDeployment.abi,
                  fundMeDeployment.address,
                  signer
              )
          })

          it("Allows people to fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await ethers.provider.getBalance(
                 fundMe.address
              )
              assert.equal(endingBalance.toString(), 0)
          })
      })
