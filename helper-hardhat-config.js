const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    137: {
        name: "polygon",
        ethUsdAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    }

}

const deploymentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 20000000000

module.exports = {
    networkConfig,
    deploymentChains,
    DECIMALS,
    INITIAL_ANSWER
}