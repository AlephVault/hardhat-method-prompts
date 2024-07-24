// function balanceOfBatch(
//     address[] calldata accounts,
//     uint256[] calldata ids
// ) external view returns (uint256[] memory);
// function setApprovalForAll(address operator, bool approved) external;
// function isApprovedForAll(address account, address operator) external view returns (bool);
// function safeTransferFrom(address from, address to, uint256 id, uint256 value, bytes calldata data) external;
// function safeBatchTransferFrom(
//     address from,
//     address to,
//     uint256[] calldata ids,
//     uint256[] calldata values,
//     bytes calldata data
// ) external;
const {extendEnvironment} = require("hardhat/config");

extendEnvironment((hre) => {
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
        }, {
            name: "uint256",
            description: "The ID of the token to query the balance for",
            message: "What's the ID of the token you want to query the balance for?",
            argumentType: "uint256"
        }], {}
    ).asTask("erc1155:balance-of", "Invokes balanceOf(address,uint256) on an ERC-1155 contract");
});