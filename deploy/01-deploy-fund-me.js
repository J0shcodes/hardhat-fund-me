const { networkConfig, deploymentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const {verify} = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const ethPriceFeedAddress = networkConfig[chainId]["ethUsdAddress"]
    let ethPriceFeedAddress
    if (deploymentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethPriceFeedAddress = networkConfig[chainId]["ethUsdAddress"]
    }
    const args = [ethPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if(!deploymentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, args)
    }

    log("------------------------------------------")
}

module.exports.tags = ["all", "fund"]
