import {addReq, getInt64Bytes, getWalletAddress,} from './helpers';
import {Address} from '@coinbarn/ergo-ts';
import {follow, p2s} from "./assembler";
import {txFee} from "./consts";
import moment from "moment";

const blake = require('blakejs')

const template = `{
  val toSendToken = $tokenAmountL
  val tokenId = fromBase64("$tokenId")
  val properSending = {
    val imp = OUTPUTS.slice(1, OUTPUTS.size - 1)
    
    val outTok = OUTPUTS(0).tokens.getOrElse(0, (INPUTS(0).id, 0L))
    val start = if (toSendToken > 0 && outTok._1 == tokenId) OUTPUTS(0).propositionBytes ++ longToByteArray(OUTPUTS(0).value) ++ longToByteArray(outTok._2)
                else OUTPUTS(0).propositionBytes ++ longToByteArray(OUTPUTS(0).value)
        
    val appended = imp.fold(start, {(x:Coll[Byte], b:Box) => {
      val tok = b.tokens.getOrElse(0, (INPUTS(0).id, 0L))
      if (toSendToken > 0 && tok._1 == tokenId)
        blake2b256(x ++ b.propositionBytes ++ longToByteArray(b.value) ++ longToByteArray(b.tokens(0)._2))
      else if (toSendToken == 0)
        blake2b256(x ++ b.propositionBytes ++ longToByteArray(b.value))
      else
        x
    }})
    appended == fromBase64("$outHash")
  }
  val returnFunds = {
    val tok = OUTPUTS(0).tokens.getOrElse(0, (INPUTS(0).id, 0L))
    val total = INPUTS.fold(0L, {(x:Long, b:Box) => x + b.value}) - 4000000
    OUTPUTS(0).value >= total && OUTPUTS(0).propositionBytes == fromBase64("$userAddress") &&
        (toSendToken == 0 || (tok._1 == tokenId && tok._2 == toSendToken))
  }
  sigmaProp(properSending || returnFunds && HEIGHT < $timestampL)
}`;

export async function startHolderAirdrop(outs) {
    const address = (await getHolderAirdropP2s(outs)).address
    console.log(address)
    let ourAddr = getWalletAddress();
    let fee = txFee
    const totalErg = outs.map(out => out.value).reduce((a, b) => a + b, 0) + fee
    const startWhen = {
        erg: totalErg,
    }
    if (outs[0].assets.length > 0)
        startWhen[outs[0].assets[0].tokenId] = outs.map(out => out.assets[0].amount).reduce((a, b) => a + b, 0)

    let request = {
        address: address,
        returnTo: ourAddr,
        startWhen: startWhen,
        txSpec: {
            requests: outs,
            fee: fee,
            inputs: ['$userIns'],
            dataInputs: [],
        },
    };
    return follow(request).then(res => {
        if (res.id !== undefined) {
            let toFollow = {
                id: res.id,
                key: 'holderAirdrop',
                status: 'follow',
                info: {
                    assets: outs[0].assets
                },
                operation: 'airdropping to holders'
            };
            addReq(toFollow, 'reqs')
        }
        res.address = address
        return res
    })
}


export async function getHolderAirdropP2s(outs) {
    let ourAddr = getWalletAddress();
    let userTreeHex = new Address(ourAddr).ergoTree

    let cur = Buffer.concat([Buffer.from(new Address(outs[0].address).ergoTree, 'hex'), Buffer.from(getInt64Bytes(outs[0].value))])
    if (outs[0].assets.length > 0)
        cur = Buffer.concat([cur, Buffer.from(getInt64Bytes(outs[0].assets[0].amount))])
    outs.slice(1, outs.size).forEach(out => {
        const tree = Buffer.from(new Address(out.address).ergoTree, 'hex')
        const valBytes = Buffer.from(getInt64Bytes(out.value))

        cur = Buffer.concat([cur, tree, valBytes])
        if (out.assets.length > 0)
            cur = Buffer.concat([cur, Buffer.from(getInt64Bytes(out.assets[0].amount))])
        cur = Buffer.from(blake.blake2b(cur, undefined, 32))
    })

    let outHash = cur.toString('base64')

    let toSendToken = outs.map(out => {
        if (out.assets.length === 0) return 0
        else return out.assets[0].amount
    }).reduce((a, b) => a + b, 0)

    let tokenId = ''
    if (outs[0].assets.length > 0) tokenId = outs[0].assets[0].tokenId
    let base64TokenId = Buffer.from(tokenId, 'hex').toString('base64');
    let userTree = Buffer.from(userTreeHex, 'hex').toString('base64');

    let script = template
        .replace('$userAddress', userTree)
        .replace('$tokenAmount', toSendToken)
        .replace('$tokenId', base64TokenId)
        .replace('$outHash', outHash)
        .replace('$timestamp', moment().valueOf())
        .replaceAll('\n', '\\n');
    return p2s(script)
}
