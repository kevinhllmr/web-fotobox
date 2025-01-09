
export function lang_de() {
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
    const done = document.getElementById("done");
    const step1 = document.getElementById("step1");
    const step2 = document.getElementById("step2");
    const step3 = document.getElementById("step3");
    const step4 = document.getElementById("step4");
    const next = document.getElementById("next");

    if(mainpage_connect_phone) {
        mainpage_connect_phone.innerHTML = "Verbinde<br>dein Handy"
    }

    if(mainpage_or) {
        mainpage_or.innerHTML = "oder"
    }

    if(mainpage_use_tablet) {
        mainpage_use_tablet.innerHTML = "Tablet benutzen"
    }

    if(mainpage_cloud) {
        mainpage_cloud.innerHTML = "Gallerie"
    }

    if(mainpage_settings) {
        mainpage_settings.innerHTML = "Admin-Einstellungen"
    }

    if(help) {
        help.innerHTML = "Hilfe"
    }

    if(help1) {
        help1.innerHTML = "<strong>Tablet benutzen</strong><br/>Drücken Sie auf das Tablet-Symbol, um die Fotobox zu starten."
    }

    if(help2) {
        help2.innerHTML = "<strong>Handy verbinden</strong><br/>Öffnen Sie die Website auf Ihrem Handy (siehe QR-Code)<br/>Drücken Sie auf das NFC-Symbol, um Ihr Handy mit dem Tablet zu verbinden (NFC-Funktion erforderlich).<br/>Folgen Sie den Anweisungen auf Ihrem Gerät."
    }

    if(help3) {
        help3.innerHTML = "<strong>Bilder auf das Handy übertragen</strong> (nur wenn das Handy mit dem Tablet verbunden ist):<br/>Öffnen Sie die Gallerie.<br/>Wählen Sie Ihr gewünschtes Bild aus.<br/>Drücken Sie auf „An Smartphone senden“."
    }

    if(close) {
        close.innerHTML = "Schließen"
    }

    if(qrcode) {
        qrcode.innerHTML = "1) Scanne diesen QR-Code<br />mit deinem Handy"
    }

    if(done) {
        done.innerHTML = "Fertig"
    }

    // if(step1) {
    //     step1.innerHTML = `Halte den NFC-Tag hier und drücke auf 'Weiter',<br />um das Angebot darauf zu schreiben`
    // }

    // if(step2) {
    //     step2.innerHTML = `Halte es jetzt gegen dein Handy<br />und drücke auf 'Angebot lesen'`
    // }

    // if(step3) {
    //     step3.innerHTML = `Drücke jetzt auf 'Antwort schreiben' auf deinem Handy,<br />während du den NFC-Tag daran hältst`
    // }

    // if(step4) {
    //     step4.innerHTML = `Halte den NFC-Tag hier und drücke auf 'Weiter',<br />um das Angebot darauf zu schreiben`
    // }

    // if(next) {
    //     next.innerHTML = "Weiter"
    // }
}