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
    ).asTask("erc20:total-supply", "Invokes totalSupply() on an ERC-20 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "name", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Name:", value);
            }
        }, [], {}
    ).asTask("erc20:name", "Invokes name() on an ERC-20 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "symbol", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Symbol:", value);
            }
        }, [], {}
    ).asTask("erc20:symbol", "Invokes symbol() on an ERC-20 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "decimals", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (value) => {
                console.log("Decimals:", value);
            }
        }, [], {}
    ).asTask("erc20:decimals", "Invokes decimals() on an ERC-20 contract");
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
    ).asTask("erc20:balance-of", "Invokes balanceOf(address) on an ERC-20 contract");
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
            name: "to",
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
        "send", "transferFrom", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Tokens transferred successfully. Transaction is:", tx);
            }
        }, [{
            name: "from",
            description: "The address to send tokens from",
            message: "Who do you want to send tokens from? (must have approved you to)",
            argumentType: "smart-address"
        }, {
            name: "to",
            description: "The address to send tokens to",
            message: "Who do you want to send tokens to?",
            argumentType: "smart-address"
        }, {
            name: "amount",
            description: "The amount to send",
            message: "What's the amount to send?",
            argumentType: "uint256"
        }], {}
    ).asTask("erc20:transfer-from", "Invokes transferFrom(address,address,uint256) on an ERC-20 contract");
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
    ).asTask("erc20:allowance", "Invokes allowance(address,address) on an ERC-20 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "send", "approve", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Tokens allowed successfully. Transaction is:", tx);
            }
        }, [{
            name: "spender",
            description: "The address to approve tokens to",
            message: "Who do you want to approve tokens to?",
            argumentType: "smart-address"
        }, {
            name: "amount",
            description: "The amount to send",
            message: "What's the amount to send?",
            argumentType: "uint256"
        }], {}
    ).asTask("erc20:approve", "Invokes approve(address,uint256) on an ERC-20 contract");
});