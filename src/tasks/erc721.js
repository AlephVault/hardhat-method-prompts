// function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
// function safeTransferFrom(address from, address to, uint256 tokenId) external;
// function transferFrom(address from, address to, uint256 tokenId) external;
// function approve(address to, uint256 tokenId) external;
// function setApprovalForAll(address operator, bool approved) external;
// function getApproved(uint256 tokenId) external view returns (address operator);
// function isApprovedForAll(address owner, address operator) external view returns (bool);
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
        }], {}
    ).asTask("erc721:balance-of", "Invokes balanceOf(address)(uint256) on an ERC-721 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "call", "ownerOf", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: async (value) => {
                console.log("Owner:", value);
                const signers = await hre.common.getSigners();
                for(let index = 0; index < signers.length; index++) {
                    let address = hre.common.getAddress(signers[index]);
                    if (address.toLowerCase() === value.toLowerCase()) {
                        console.log("This address belongs to the account with index:", index);
                    }
                }
            }
        }, [{
            name: "address",
            description: "The address to query the balance for",
            message: "Who do you want to query the balance for?",
            argumentType: "smart-address"
        }], {}
    ).asTask("erc721:owner-of", "Invokes ownerOf(uint256)(address) on an ERC-721 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "send", "safeTransferFrom(address,address,uint256)", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Token transferred successfully. Transaction is:", tx);
            }
        }, [{
            name: "from",
            description: "The address to send the token from",
            message: "Who do you want to send the token from? (must be you or must approve you)",
            argumentType: "smart-address"
        }, {
            name: "to",
            description: "The address to send the token to",
            message: "Who do you want to send the token to?",
            argumentType: "smart-address"
        }, {
            name: "tokenId",
            description: "The ID of the token to send",
            message: "What's the ID of the token to send?",
            argumentType: "uint256"
        }], {}
    ).asTask("erc721:safe-transfer-from", "Invokes safeTransferFrom(address,address,uint256) on an ERC-721 contract");
    new hre.methodPrompts.ContractMethodPrompt(
        "send", "safeTransferFrom(address,address,uint256,bytes)", {
            onError: (e) => {
                console.error("There was an error while running this method");
                console.error(e);
            },
            onSuccess: (tx) => {
                console.log("Token transferred successfully. Transaction is:", tx);
            }
        }, [{
            name: "from",
            description: "The address to send the token from",
            message: "Who do you want to send the token from? (must be you or must approve you)",
            argumentType: "smart-address"
        }, {
            name: "to",
            description: "The address to send the token to",
            message: "Who do you want to send the token to?",
            argumentType: "smart-address"
        }, {
            name: "tokenId",
            description: "The ID of the token to send",
            message: "What's the ID of the token to send?",
            argumentType: "uint256"
        }, {
            name: "data",
            description: "The data for this operation",
            message: "Data for this send (use direct 0x for no data, or a dumb empty text input)",
            argumentType: "hashed"
        }], {}
    ).asTask("erc721:safe-transfer-from-with-data", "Invokes safeTransferFrom(address,address,uint256,bytes) on an ERC-721 contract");
});