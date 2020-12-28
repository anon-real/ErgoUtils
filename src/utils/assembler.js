import {get, post} from './rest';
import {addReq, getForKey, getUrl, setForKey, showStickyMsg,} from './helpers';
import moment from "moment";

const url = 'https://assembler.ergoutils.org/';
export const txFee = 2000000

export async function follow(request) {
    return await post(getUrl(url) + '/follow', request).then((res) =>
        res.json()
    ).then(res => {
        if (res.success === false) throw new Error()
        return res
    });
}

export async function stat(id) {
    return await get(getUrl(url) + '/result/' + id).then((res) => res.json());
}

export async function p2s(request) {
    return await post(getUrl(url) + '/compile', request).then((res) =>
        res.json()
    ).then(res => {
        if (res.success === false) throw new Error()
        return res
    });
}

export async function reqFollower() {
    let reqs = getForKey('reqs').filter(cur => cur.status === 'follow');
    let all = reqs.map((cur) => stat(cur.id));
    Promise.all(all).then((res) => {
        let newReqs = [];
        res.forEach((out) => {
            if (out.id !== undefined) {
                let req = reqs.find((cur) => cur.id === out.id);
                if (out.detail === 'success') {
                    showStickyMsg(
                        "Your request for " + req.operation + " is done by the assembler service!"
                    );
                    req.status = 'success'
                    req.txId = out.tx.id
                    let tx = out.tx
                    if (tx.creationTimestamp === undefined) tx.creationTimestamp = moment().valueOf()
                    tx.info = req.info
                    addReq(out.tx, req.key)

                } else if (out.detail === 'returning') {
                    req.status = 'returning'
                    req.txId = out.tx.id
                    showStickyMsg(
                        'Your funds are being returned to you.',
                        false,
                        true
                    );
                } else if (out.detail === 'return failed') {
                    req.status = 'failed'
                }
                newReqs.push(req)
            }
        });
        setForKey(newReqs, 'reqs')
    });
}

