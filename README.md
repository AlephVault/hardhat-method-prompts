# hardhat-method-prompts
A hardhat plugin offering the possibility to quickly implement prompt-powered method calls to contracts.

# Installation
Run this command to install it from NPM:

```shell
npm install --save-dev hardhat-common-tools@^1.4.0 hardhat-enquirer-plus@^1.4.1 hardhat-blueprints@^1.2.2
```

# Usage
You'll not typically make use of this package directly, save for developing your own sub-packages or tasks.

If that's the case, then this package allows you to create method calls (which can be static or transactional).

## Creating a method call
Let's say you want to create a `mint` call for an ERC-1155 contract. You can define your method like this:

```javascript
const method = new hre.methodPrompts.ContractMethodPrompt(
    "send", "mint", {
        onError: (e) => {
            console.error("There was an error while running this method");
            console.error(e);
        },
        onSuccess: (tx) => {
            console.log("The method ran successfully:", tx);
        }
    }, [{
        name: "to",
        description: "The target of the mint",
        message: "Who will receive the minted tokens?",
        argumentType: "smart-address"
    }, {
        name: "id",
        description: "The ID of the token",
        message: "What's the token you want to mint?",
        argumentType: "uint256"
    }, {
        name: "value",
        description: "The amount of that token",
        message: "What's the amount of the token?",
        argumentType: "uint256"
    }, {
        name: "data",
        description: "The data for the transaction",
        message: "Add some hexadecimal binary data:",
        argumentType: "bytes"
    }], {
        account: {onAbsent: "default"},
        gasPrice: {onAbsent: "prompt"}
    }
);
```

And then invoking it like this:

```javascript
await method.invoke(
    deploymentId, someContractId, {to, id, amount, data}, {gasPrice, account}, nonInteractive
);
```