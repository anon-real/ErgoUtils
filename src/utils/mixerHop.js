// let ergolib = import('ergo-lib-wasm-browser')
//
import {
    Address,
    BlockHeaders,
    BoxValue,
    Contract,
    ErgoBox,
    ErgoBoxCandidateBuilder,
    ErgoBoxCandidates,
    ErgoBoxes,
    ErgoStateContext,
    I64,
    PreHeader,
    SecretKey,
    SecretKeys,
    SimpleBoxSelector,
    Tokens,
    TxBuilder,
    Wallet,
} from 'ergo-lib-wasm-browser';
import {toHexString} from "./serializer";
import {addReq, getForKey, setForKey, showMsg, showStickyMsg, sleep} from "./helpers";
import {lastBlock, sendTx, txConfNum, unspentBoxesFor} from "./explorer";
import moment from "moment";
import {post} from "./rest";

const nodes = ['https://node.ergoutils.org']

const block_headers = BlockHeaders.from_json([
    {
        "extensionId": "ea95fb1d729db6d3ae82f11f4aea69ac07fa4775b3ea5f015786d51a3dc22007",
        "difficulty": "1639165678583808",
        "votes": "000000",
        "timestamp": 1621452925826,
        "size": 221,
        "stateRoot": "23eb2400fc5aefd95484e94e881f13644b79067a3f54ef6d46132931026235c914",
        "height": 493407,
        "nBits": 117822160,
        "version": 2,
        "id": "cc553c00d9fad0b1b2b23cb26a4851f51dc5a0b6e7de20ca87cc62af01871b9e",
        "adProofsRoot": "9b6367fbcb3c9dafd824c7d8eddcf0eaee997c07ef13cf90e1bb8ed4aabb8aa3",
        "transactionsRoot": "886e6aac18929f28cc4b3a5155665ae5c3c3a25562ca38087025aad27faa4561",
        "extensionHash": "b47c7fccf79ba52170ca1564703a21db92707efaffeacfea9bf45b342433773d",
        "powSolutions": {
            "pk": "03740a41a55d8239bc1cc9995b6393464fea8e02570be98fb808455da6141366cf",
            "w": "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",
            "n": "12daabef8d3cb86b",
            "d": 0
        },
        "adProofsId": "9d8deed5b357fb0c9604b6ab72420be7a06162b300d3d57455cbb3ee4e9b3759",
        "transactionsId": "2ace432f49419a7f01a67451cc944dcbd1d837eab26cc09ce72d9e24cd7eacb8",
        "parentId": "420d5ce239729ef086c32291977efa7ba6282f93ebc3fd5b18c9a7e363d0959e"
    }
]);

const chunks = [.2, .4, .6, .8]

function randInt(mn = 1, mx = 3) {
    return Math.floor(Math.random() * (mx - mn + 1)) + mn;
}

function getFee() {
    return [1000000, 1100000, 1200000, 1300000][randInt(0, 3)]
}

function getBoxValue(val) {
    return BoxValue.from_i64(I64.from_str(val.toString()))
}

export function rndSecret() {
    return toHexString(SecretKey.random_dlog().to_bytes())
}

export function secToAddr(sec) {
    return SecretKey.dlog_from_bytes(Buffer.from(sec, 'hex')).get_address().to_base58(0)
}

export function obfuscateBox(box, secret, outAddr, header, numLvls) {
    let levelSecs = []
    let txs = []
    outAddr = Address.from_mainnet_str(outAddr);

    let curIn = ErgoBox.from_json(box)
    let inTokens = curIn.tokens()
    let curs = new ErgoBoxes(curIn)
    let curSecs = [SecretKey.dlog_from_bytes(Buffer.from(secret, 'hex'))]

    for (let i = 0; i < numLvls + 1; i++) {
        const sks = new SecretKeys();
        curSecs.forEach(sec => sks.add(sec))
        curSecs = []
        for (let j = 0; j < randInt(); j++)
            curSecs.push(SecretKey.random_dlog())
        levelSecs.push(curSecs.map(sec => toHexString(sec.to_bytes())))


        const outs = ErgoBoxCandidates.empty();
        let txFee = getFee()
        let amount = -txFee
        for (let j = 0; j < curs.len(); j++) amount += curs.get(j).value().as_i64().as_num()
        let inSum = amount
        while (outs.len() < curSecs.length - 1 && i < numLvls) {
            let split = chunks[randInt(0, chunks.length - 1)]
            let curAmount = Math.floor(amount * split)
            amount -= curAmount

            const outbox = new ErgoBoxCandidateBuilder(getBoxValue(curAmount),
                Contract.pay_to_address(curSecs[outs.len()].get_address()), header.height).build();
            outs.add(outbox)
        }
        let addr = curSecs[outs.len()].get_address()
        if (i === numLvls) addr = outAddr
        const outbox = new ErgoBoxCandidateBuilder(getBoxValue(amount),
            Contract.pay_to_address(addr), header.height);
        for (let j = 0; j < inTokens.len(); j++)
            outbox.add_token(inTokens.get(j).id(), inTokens.get(j).amount())

        outs.add(outbox.build())

        const box_selector = new SimpleBoxSelector();
        const box_selection = box_selector.select(curs, getBoxValue(inSum + txFee), inTokens);
        const tx_builder = TxBuilder.new(box_selection, outs, header.height, getBoxValue(txFee), outAddr, BoxValue.SAFE_USER_MIN());
        const tx = tx_builder.build();
        const wallet = Wallet.from_secrets(sks);

        // const pre_header = PreHeader.from_block_header(BlockHeaders.from_json([header]).get(0));
        const pre_header = PreHeader.from_block_header(block_headers.get(0));
        const ctx = new ErgoStateContext(pre_header);
        const signed_tx = wallet.sign_transaction(ctx, tx, box_selection.boxes(), ErgoBoxes.from_boxes_json([]));
        txs.push(signed_tx.to_json())
        curs = ErgoBoxes.from_boxes_json([])
        signed_tx.to_json().outputs.forEach(function (out, ind) {
            if (ind < signed_tx.to_json().outputs.length - 1)
                curs.add(ErgoBox.from_json(JSON.stringify(out)))
        })
    }
    return [txs, levelSecs]
}

export async function broadcastTxs(txs) {
    console.log('broadcasting')
    for (let i = 0; i < txs.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
            try {
                await post(nodes[j] + '/transactions', txs[i])
            } catch (err) {
            }
        }
        await sleep(200)
    }
}

export async function handleEntries() {
    let secs = getForKey('hops')
    let header = await lastBlock()
    let allBoxes = getForKey('doneBoxes')
    let newBoxes = []

    for (let i = 0; i < allBoxes.length; i++) {
        if (!allBoxes[i].mined) {
            let confNum = await txConfNum(allBoxes[i].txs[allBoxes[i].txs.length - 1].id)
            if (confNum < 3) newBoxes.push(allBoxes[i])
            else {
                allBoxes[i].mined = true
                newBoxes.push(allBoxes[i])
            }
            if (confNum === 0) await broadcastTxs(allBoxes[i].txs)
        } else newBoxes.push(allBoxes[i])
    }
    setForKey(newBoxes, 'doneBoxes')

    let processedBoxes = allBoxes.map(box => box.box)

    for (let i = 0; i < secs.length; i++) {
        let boxes = (await unspentBoxesFor(secs[i].depositAddr)).filter(box => !processedBoxes.includes(box.id))
        for (let j = 0; j < boxes.length; j++) {
            let obfRes = await obfuscateBox(JSON.stringify(boxes[j]), secs[i].secret, secs[i].toAddr, header, secs[i].numLvls)
            let txs = obfRes[0]
            let lvlSecs = obfRes[1]
            await broadcastTxs(txs)
            addReq({
                box: boxes[j].id,
                value: boxes[j].value,
                txs: txs,
                mined: false,
                secs: lvlSecs,
                time: moment().valueOf()
            }, 'doneBoxes')
            showStickyMsg(`Successfully obfuscated ${boxes[j].value / 1e9} ERG. Check it out in the My Withdrawals section!`)
        }
    }
    await sleep(10000)
}

