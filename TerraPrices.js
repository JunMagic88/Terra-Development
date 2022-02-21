/*========================================================================\
  JS script to query the current pool prices for pairs traded on Terraswap  
                                                                           
  Pre-requisite:                                                          
   - npm install @terra-money/terra.js                                    
\========================================================================*/

import { LCDClient } from "@terra-money/terra.js";
let token1 = "";
let token2 = "";
let beliefPrice ="";

//Connect to Terra mainnet
const lcd = new LCDClient({ URL: 'https://lcd.terra.dev', chainID: 'columbus-5',});

/*========================================================================================\

  Copy the contract address for the PAIR you want get prices for:
    LUNA <> BLUNA: "terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p";
    ANC <> UST: "terra1gm5p3ner9x9xpwugn9sp6gvhd0lwrtkyrecdn3";
    MIR <> UST: terra143xxfw5xf62d5m32k3t4eu9s82ccw80lcprzl9
    mAssets <> UST: https://github.com/Mirror-Protocol/whitelist/blob/master/columbus.json 

\========================================================================================*/

// Paste the contract address for the pair you want to query prices for
const pair = "terra14hklnm2ssaexjwkcfhyyyzvpmhpwx6x6lpy39s";

const { assets } = await lcd.wasm.contractQuery(pair, { pool: {} });

if(JSON.stringify(assets[1].info).indexOf('native_token') > -1){
    beliefPrice = (assets[1].amount / assets[0].amount).toFixed(4);
    token1 = await lcd.wasm.contractQuery(assets[0].info.token.contract_addr,{token_info:{}});
    token2 = assets[1].info.native_token.denom;
    console.log(`Price of ${token1.symbol} is ${beliefPrice} ${token2}\n`);
} else {
    beliefPrice = (assets[0].amount / assets[1].amount).toFixed(4);
    token1 = await lcd.wasm.contractQuery(assets[1].info.token.contract_addr,{token_info:{}});
    token2 = assets[0].info.native_token.denom;
    console.log(`Price of 1 ${token1.symbol} is ${beliefPrice} ${token2}\n`);
}
