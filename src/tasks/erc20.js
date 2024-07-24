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
    new hre.methodPrompts.ContractMethodPrompt(
        "send", "transfer", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Tokens transferred successfully. Transaction is:", tx);
            }
        }, [{
            name: "address",
            description: "The address to send tokens to",
            message: "Who do you want to send tokens to?",
            argumentType: "smart-address"
        }, {
            name: "amount",
            description: "The amount to send",
            message: "What's the amount to send?",
            argumentType: "uint256"
        }], {}
    ).asTask("erc20:transfer", "Invokes transfer(address,uint256) on an ERC-20 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "allowance", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Allowed:", value);
            }
        }, [{
            name: "owner",
            description: "The owner of the tokens",
            message: "Who'll be the owner you want to query for?",
            argumentType: "smart-address"
        }, {
            name: "allowed",
            description: "The user who ask the allowance for",
            message: "Who'll be the user to query the # of allowed tokens?",
            argumentType: "smart-address"
        }], {}
    ).asTask("erc20:allowance", "Invokes allowance(address,address)(uint256) on an ERC-20 contract", {onlyExplicitTxOptions: true});
});