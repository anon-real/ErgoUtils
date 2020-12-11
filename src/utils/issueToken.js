import {post, get} from './rest';
import {
    addAssemblerBid,
    addBid,
    getAssemblerBids,
    getUrl,
    getWalletAddress,
    isAssembler,
    isWalletNode,
    setAssemblerBids,
    showMsg,
} from './helpers';
import {Address, Transaction} from '@coinbarn/ergo-ts';
import {
    additionalData,
    auctionFee,
    auctionWithExtensionTree,
    extendNum,
    extendThreshold,
    sendTx, trueAddress,
} from './explorer';
import {decodeNum, decodeString, encodeHex, encodeNum} from './serializer';
import {addReq, follow, p2s, txFee} from "./assembler";

const template = `{
  val outputOk = {
    val issued = OUTPUTS(0).tokens.getOrElse(0, (INPUTS(0).id, 0L))
    INPUTS(0).id == issued._1 && issued._2 == $amount &&
      OUTPUTS(0).value == $ergAmount &&
      OUTPUTS(0).propositionBytes == fromBase64("$toAddress")
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 4000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == fromBase64("$userAddress")
  }
  sigmaProp(OUTPUTS.size == 2 && (outputOk || returnFunds))
}`;

export async function issueToken(quantity, ergAmount, toAddress, name, description, decimals, address) {
    let ourAddr = getWalletAddress();

    let outBox = {
        ergValue: ergAmount,
        amount: quantity,
        address: toAddress,
        name: name,
        description: description,
        decimals: decimals
    };

    let request = {
        address: address,
        returnTo: ourAddr,
        startWhen: {
            erg: ergAmount + txFee,
        },
        txSpec: {
            requests: [outBox],
            fee: txFee,
            inputs: ['$userIns'],
            dataInputs: [],
        },
    };
    return follow(request).then(res => {
        if (res.id !== undefined) {
            let toFollow = {
                id: res.id,
                key: 'tokenIssuance',
                status: 'follow',
                operation: 'issuing token'
            };
            addReq(toFollow, 'reqs')
        }
        return res
    })
}

export async function getTokenP2s(toAddress, quantity, ergAmount) {
    let ourAddr = getWalletAddress();
    let userTreeHex = new Address(ourAddr).ergoTree
    let toTreeHex = new Address(toAddress).ergoTree

    let userTree = Buffer.from(userTreeHex, 'hex').toString('base64');
    let toTree = Buffer.from(toTreeHex, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$ergAmount', ergAmount)
        .replace('$amount', quantity)
        .replace('$toAddress', toTree)
        .replaceAll('\n', '\\n');
    return p2s(script);
}

