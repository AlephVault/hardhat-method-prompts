// function totalSupply() external view returns (uint256);
// function balanceOf(address account) external view returns (uint256);
// function transfer(address to, uint256 value) external returns (bool);
// function allowance(address owner, address spender) external view returns (uint256);
// function approve(address spender, uint256 value) external returns (bool);
// function transferFrom(address from, address to, uint256 value) external returns (bool);
const {extendEnvironment} = require("hardhat/config");

extendEnvironment((hre) => {
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "totalSupply", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Total Supply:", value);
            }
        }, [], {}
    ).asTask("erc20:total-supply", "Invokes totalSupply()(uint256) on an ERC-20 contract", {onlyExplicitTxOptions: true});
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "balanceOf", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Balance:", value);
            }
        }, [{
            name: "address",
            description: "The address to query the balance for",
            message: "Who do you want to query the balance for?",
            argumentType: "smart-address"
        }], {}
    ).asTask("erc20:balance-of", "Invokes balanceOf(address)(uint256) on an ERC-20 contract", {onlyExplicitTxOptions: true});
});