//Refer to Terra docs here: https://docs.terra.money/docs/develop/sdks/terra-js/common-examples.html

import {
  MsgExecuteContract,
  MnemonicKey,
  Coins,
  LCDClient,
} from "@terra-money/terra.js";

//Connect to testnet / mainnet
//const lcd = new LCDClient({ URL: 'https://lcd.terra.dev', chainID: 'columbus-5',});
const lcd = new LCDClient({ URL: 'https://bombay-lcd.terra.dev', chainID:'bombay-12' });

const mk = new MnemonicKey({
  mnemonic: 'notice oak limit worry wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius',
});

const wallet = lcd.wallet(mk);
console.log('Wallet created. Address: '+ await wallet.key.accAddress+'\n...');

// mAsset PAIR testnet addresses: https://github.com/Mirror-Protocol/whitelist/blob/master/bombay.json
// mAsset PAIRs mainet addresses: https://github.com/Mirror-Protocol/whitelist/blob/master/columbus.json
// aUST <> mSLV
const pool = "terra1tyzsl0dw4pltlqey5v6g646hm22pql8vy3yh2g";

// Fetch the number of each asset in the pool.
const { assets } = await lcd.wasm.contractQuery(pool, { pool: {} });

// Calculate belief price using pool balances.
const beliefPrice = (assets[0].amount / assets[1].amount).toFixed(18);

console.log('asset 1: '+assets[0].amount+'\n'+'asset 2: '+assets[1].amount+'\n'+'belief price = '+beliefPrice);

// Swap 1 UST to mSLV with 1% slippage tolerance.

const terraSwap = new MsgExecuteContract(
  wallet.key.accAddress,
  pool, 
  {
    swap: {
      max_spread: "0.01",
      offer_asset: {
        info: {
          native_token: {
            denom: "uusd",
          },
        },
        amount: "1000000",
      },
      belief_price: beliefPrice,
    },
  },
  new Coins({ uusd: '1000000' }),
);

const tx = await wallet.createAndSignTx({ msgs: [terraSwap] });
const result = await lcd.tx.broadcast(tx);

console.log(result);