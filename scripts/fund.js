const { deployments, ethers } = require("hardhat")

async function main() {
    const accounts = await ethers.getSigners()
    const signer = accounts[0]

    const fundMeDeployment = await deployments.get("FundMe")
    const fundMe = await ethers.getContractAt(
        fundMeDeployment.abi,
        fundMeDeployment.address,
        signer
    )
    console.log("Funding contract...")
    const transactionResponse = await fundMe.fund({
        value: ethers.parseEther("1"),
    })
    await transactionResponse.wait(1)
    console.log("Funded!")
}

main()
    .then(() => {
        process.exit(0)
    })
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
