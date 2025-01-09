export function lang_en() {
    const mainpage_connect_phone = document.getElementById("nfc-text");
    const mainpage_or = document.getElementById("or");
    const mainpage_use_tablet = document.getElementById("tablet-text");
    const mainpage_cloud = document.getElementById("cloud");
    const mainpage_settings = document.getElementById("settings");
    const help = document.getElementById("help");
    const help1 = document.getElementById("help1");
    const help2 = document.getElementById("help2");
    const help3 = document.getElementById("help3");
    const close = document.getElementById("close");
    const qrcode = document.getElementById("qrcode");
    const done = document.getElementById("done")
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    const step4 = document.getElementById("step4");
    const next = document.getElementById("next");

    if(mainpage_connect_phone) {
        mainpage_connect_phone.innerHTML = "Connect<br>your Phone"
    }

    if(mainpage_or) {
        mainpage_or.innerHTML = "or"
    }

    if(mainpage_use_tablet) {
        mainpage_use_tablet.innerHTML = "Use Tablet"
    }

    if(mainpage_cloud) {
        mainpage_cloud.innerHTML = "Gallery"
    }

    if(mainpage_settings) {
        mainpage_settings.innerHTML = "Admin Settings"
    }

    if(help) {
        help.innerHTML = "Help"
    }
    
    if(help1) {
        help1.innerHTML = "<strong>Using the Tablet</strong><br/>Press the tablet icon to start the tablet."
    }

    if(help2) {
        help2.innerHTML = "<strong>Connect Phone</strong><br/>Press the NFC icon to connect your phone to the tablet (NFC functionality required).<br/>Follow the instructions on your device."
    }

    if(help3) {
        help3.innerHTML = '<strong>Transfer Images to Phone</strong> (only when the phone is connected to the tablet):<br/>pen the gallery.<br/>Select your desired image.<br/>Press „Send to Smartphone.'
    }

    if(close) {
        close.innerHTML = "Close"
    }

    if(qrcode) {
        qrcode.innerHTML = "1) Scan this QR Code<br />with your phone"
    }

    if(done) {
        done.innerHTML = "Done"
    }

    // if(step1) {
    //     step1.innerHTML = `2) Hold the NFC tag here and press on<br />"Next" to write the offer to it`
    // }

    // if(step2) {
    //     step2.innerHTML = `3) Now hold it against your phone<br />and press on "Read Offer"`
    // }

    // if(step3) {
    //     step3.innerHTML = `4) Now press "Write Answer" on your phone<br />while holding the NFC against it`
    // }

    // if(step4) {
    //     step4.innerHTML = `5) Finally, hold the tag here and press<br />"Finish" to read the answer`
    // }

    // if(next) {
    //     next.innerHTML = "Next"
    // }
}