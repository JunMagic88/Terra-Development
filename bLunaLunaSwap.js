//bLuna-Luna bot

var currentdate = new Date(); 
var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 

import {
  MsgExecuteContract,
  MnemonicKey,
  Coins,
  LCDClient
} from "@terra-money/terra.js";

import * as fs from 'fs';

//Connect to testnet OR mainnet
const lcd = new LCDClient({ 
  URL: 'https://lcd.terra.dev', 
  chainID: 'columbus-5',
  gasPrices: {uusd: 0.25} 
});
/*const lcd = new LCDClient({ 
  URL: 'https://bombay-lcd.terra.dev', 
  chainID:'bombay-12',
  gasPrices: {uusd: 0.25} 
});*/

const mk = new MnemonicKey({
  mnemonic: 'recipe allow tuna float swallow tray armor connect birth shop crunch offer movie night sheriff own inflict manual cricket broccoli decade electric ordinary similar',
});

const wallet = lcd.wallet(mk);
console.log('Wallet created. Address: '+ await wallet.key.accAddress+'\n...');

//Luna <> bLuna
const pool = "terra1jxazgm67et0ce260kvrpfv50acuushpjsz2y0p"; //mainnet
//const pool = "terra13e4jmcjnwrauvl2fnjdwex0exuzd8zrh5xk29v" //testnet

//bLuna smart contract
const bluna = "terra1kc87mu460fwkqte29rquh4hc20m54fxwtsx7gp" //mainnet
//const bluna = "terra1u0t35drzyy0mujj8rkdyzhe264uls4ug3wdp3x" //testnet

// Fetch the number of each asset in the pool.
const { assets } = await lcd.wasm.contractQuery(pool, { pool: {} });

// Calculate belief price using pool balances.
const beliefPrice = (assets[1].amount / assets[0].amount).toFixed(18);

console.log('asset 1: '+assets[0].amount+'\n'+'asset 2: '+assets[1].amount+'\n'+'belief price = '+beliefPrice);

let log = datetime+" Did nothing. Belief Price = "+beliefPrice+"\n";
// Check in-wallet bLuna balance
const bLunaQuery = await lcd.wasm.contractQuery(bluna, {
  balance: {
    address: wallet.key.accAddress,
  }, 
});
const blunaBal = bLunaQuery['balance'].toString();
// Check in-wallet Luna balance
const lunaQuery = await lcd.bank.balance(wallet.key.accAddress); // get balances of native tokens
let lunaBalance =""
if (lunaQuery[0].get('uluna')!==undefined){
  lunaBalance = lunaQuery[0].get('uluna').amount.toString();
} else {
  lunaBalance = "0";
}

console.log("Luna Balance: "+lunaBalance+"; bLuna Balance: "+blunaBal+"\n");

if (beliefPrice < 0.973){
  if (lunaBalance > blunaBal) {
    const terraSwap = new MsgExecuteContract(
      wallet.key.accAddress,
      pool, 
      {
        swap: {
          max_spread: "0.025",
          offer_asset: {
            info: {
              native_token: {
                denom: "uluna",
              },
            },
            amount: lunaBalance
          },
          belief_price: beliefPrice,
        },
      },
      new Coins({ uluna: lunaBalance}),
    ); 
    const tx = await wallet.createAndSignTx({ msgs: [terraSwap] });
    const result = await lcd.tx.broadcast(tx);
    log = datetime+ "Swapped Luna to bLuna @"+beliefPrice+"; "+" Tx hash: "+result.txhash+"; trans fee: $"+result.gas_wanted*0.15*1.66667/1000000+"\n";
  
  }
}
if(beliefPrice > 0.983){
  if(blunaBal>lunaBalance){
      const swapMsg = {
        swap: {
            max_spread: "0.025"
        },
      };
      const base64SwapMsg = Buffer.from(JSON.stringify(swapMsg)).toString("base64");
      
      const swapHandleMessage = {
        send: {
          amount: blunaBal,
          contract: pool,
          msg: base64SwapMsg,
        },
      };
      const executeSwap = new MsgExecuteContract(
        wallet.key.accAddress,
        bluna,
        swapHandleMessage
      );
      
      const transaction = await wallet.createAndSignTx({
        msgs: [executeSwap],
      });
      const result = await lcd.tx.broadcast(transaction);
      log = datetime+ "Swapped bLuna to Luna @"+beliefPrice+"; "+" Tx hash: "+result.txhash+"; trans fee: $"+result.gas_wanted*0.15*1.66667/1000000+"\n";
  }
}

//write to log
fs.appendFile('bLuna.txt', log, function (err) {
  if (err) throw err;
  console.log('Saved!');
});