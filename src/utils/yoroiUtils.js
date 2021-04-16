/* eslint no-undef: "off"*/
import {showMsg} from "./helpers";

export async function setupYoroi() {
    if (typeof ergo_request_read_access === "undefined") {
        showMsg('You must install Yoroi-Ergo dApp Connector to be able to connect to Yoroi', true)
    } else {
        window.addEventListener("ergo_wallet_disconnected", function(event) {
            showMsg('Disconnected from Yoroi wallet')
        });
        let hasAccess = await ergo_check_read_access()
        if (!hasAccess) {
            let granted = await ergo_request_read_access()
            if (!granted) {
                showMsg('Wallet access denied', true)
            } else {
                showMsg('Successfully connected to Yoroi')
                return true
            }
        } else return true
    }
    return false
}

