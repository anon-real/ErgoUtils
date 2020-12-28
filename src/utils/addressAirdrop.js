import {addReq, getWalletAddress,} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {follow, p2s, txFee} from "./assembler";
import {encodeHex} from "./serializer";
import {Serializer} from "@coinbarn/ergo-ts/dist/serializer";
const blake = require('blakejs')

const template = `{
  val properSending = {
    val toSendErg = $amountL
    val toSendToken = $tokenAmountL
    val tokenId = fromBase64("$tokenId")
    val imp = OUTPUTS.slice(1, OUTPUTS.size - 1)
    val appended = imp.fold(OUTPUTS(0).propositionBytes, {(x:Coll[Byte], b:Box) => {
      val tok = b.tokens.getOrElse(0, (INPUTS(0).id, 0L))
      if (b.value == toSendErg && (toSendToken == 0 || (tok._1 == tokenId && tok._2 == toSendToken)))
        x ++ b.propositionBytes
      else
        x
    }})
    val tok = OUTPUTS(0).tokens.getOrElse(0, (INPUTS(0).id, 0L))
    OUTPUTS(0).value == toSendErg &&
      blake2b256(appended) == fromBase64("$outHash") &&
      (toSendToken == 0 || (tok._1 == tokenId && tok._2 == toSendToken))
  }
  val returnFunds = {
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 4000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == fromBase64("$userAddress")
  }
  sigmaProp(properSending || returnFunds)
}`;

export function addrAirdropFee(outLen) {
    return Math.ceil(outLen / 10) * 2000000
}

export async function startAddrAirdrop(address, addrList, ergAmount, tokenId, tokenAmount, includingFee) {
    let addresses = addrList.addresses
    let ourAddr = getWalletAddress();
    let fee = addrAirdropFee(addresses.length)

    let toDistributeErg = (ergAmount - (includingFee ? fee : 0))
    let toSendErg = Math.floor(toDistributeErg / addresses.length)
    let toSendToken = Math.floor(tokenAmount / addresses.length)
    fee = fee + (toDistributeErg - addresses.length * toSendErg)

    let outs = addresses.map(addr => {
        let box = {
            address: addr,
            value: toSendErg
        }
        if (tokenId) box.assets = [
            {
                tokenId: tokenId,
                amount: toSendToken
            }
        ]
        return box
    })

    let request = {
        address: address,
        returnTo: ourAddr,
        startWhen: {
            erg: addresses.length * toSendErg + fee,
        },
        txSpec: {
            requests: outs,
            fee: fee,
            inputs: ['$userIns'],
            dataInputs: [],
        },
    };
    if (tokenId) request.startWhen[tokenId] = tokenAmount
    return follow(request).then(res => {
        if (res.id !== undefined) {
            let toFollow = {
                id: res.id,
                key: 'addrAirdrop',
                status: 'follow',
                info: {
                    lstName: addrList.name,
                    ergValue: ergAmount
                },
                operation: 'airdropping to list of addresses'
            };
            console.log(toFollow)
            addReq(toFollow, 'reqs')
        }
        return res
    })
}


export async function getAddrAirdropP2s(addresses, ergAmount, tokenId, tokenAmount, includingFee) {
    let ourAddr = getWalletAddress();
    let userTreeHex = new Address(ourAddr).ergoTree

    let cur = Buffer.from(new Address(addresses[0]).ergoTree, 'hex')
    addresses.slice(1, addresses.size).forEach(addr => {
        let tree = new Address(addr).ergoTree
        cur = Buffer.concat([cur, Buffer.from(tree, 'hex')])
    })
    let addrHash = Buffer.from(blake.blake2b(cur, undefined, 32)).toString('base64')
    let toSendErg = Math.floor((ergAmount - (includingFee ? addrAirdropFee(addresses.length) : 0)) / addresses.length)
    let toSendToken = Math.floor(tokenAmount / addresses.length)

    let base64TokenId = Buffer.from(tokenId, 'hex').toString('base64');

    let userTree = Buffer.from(userTreeHex, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$amount', toSendErg)
        .replace('$tokenAmount', toSendToken)
        .replace('$tokenId', base64TokenId)
        .replace('$outHash', addrHash)
        .replaceAll('\n', '\\n');
    return p2s(script);
}
