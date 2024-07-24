const {extendEnvironment} = require("hardhat/config");

extendEnvironment((hre) => {
    new hre.methodPrompts.CustomPrompt(
        function([address]) {
            return hre.common.getBalance(address);
        }, {
            onError: (e) => {
                console.error("There was an error while getting the balance");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("The method ran successfully:", tx);
            }
        }, [{
            name: "address",
            description: "The address (or account index) to query the balance for",
            message: "What's the address (or account index) you want to query the balance for?",
            argumentType: "smart-address"
        }], {}
    ).asTask("balance-of", "Gets the native balance of for an account", {onlyExplicitTxOptions: true});

    new hre.methodPrompts.CustomPrompt(
        function([address], txOpts) {
            return hre.common.transfer(address, txOpts);
        }, {
            onError: (e) => {
                console.error("There was an error while getting the balance");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Tokens transferred successfully. Transaction is:", tx);
            }
        }, [{
            name: "address",
            description: "The address (or account index) to send native tokens to",
            message: "What's the address (or account index) to send native tokens to?",
            argumentType: "smart-address"
        }], {
            value: {onAbsent: "prompt"},
            account: {onAbsent: "default"},
            gasPrice: {onAbsent: "default"}
        }
    ).asTask("transfer", "Transfers native currency to another account");
});