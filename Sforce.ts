//THIS PROGRAM WORKED TO UPLOAD NAME, SYMBOL AND IMAGE OF THE TOKEN
//FOR FUTURE JUST CHANGE THE TOKEN ADDRESS AND METADATA
import {Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';

export function loadWalletKey(keypairFile:string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }

const INITIALIZE = true;

async function main(){
    console.log("let's name some tokens in 2024!");
    const myKeypair = loadWalletKey("kharkosak.json");
    const mint = new web3.PublicKey("GHbesEeefYfk36o1xhs1PcawRz3bEGAiz2BN1P7qrx5L");

    const umi = createUmi("https://api.mainnet-beta.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "SolForce",
        symbol: "SOFO",
        uri: "https://pink-neighbouring-mite-14.mypinata.cloud/ipfs/QmNvnSZTxW9PaeM9MDUidqWwD8eGWmWc3HqxsA8joMgqP7",
    }
    const onChainData = {
        ...ourMetadata,
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
    }
    if(INITIALIZE){
        const accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            mintAuthority: signer,
        }
        const data: CreateMetadataAccountV3InstructionDataArgs = {
            isMutable: true,
            collectionDetails: null,
            data: onChainData
        }
        const txid = await createMetadataAccountV3(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(txid)
    } else {
        const data: UpdateMetadataAccountV2InstructionData = {
            data: some(onChainData),
            discriminator: 0,
            isMutable: some(true),
            newUpdateAuthority: none<PublicKey>(),
            primarySaleHappened: none<boolean>()
        }
        const accounts: UpdateMetadataAccountV2InstructionAccounts = {
            metadata: findMetadataPda(umi,{mint: fromWeb3JsPublicKey(mint)}),
            updateAuthority: signer
        }
        const txid = await updateMetadataAccountV2(umi, {...accounts, ...data} ).sendAndConfirm(umi);
        console.log(txid)
    }

}

main();