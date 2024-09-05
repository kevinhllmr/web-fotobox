
export function lang_de() {
    const mainpage_connect_phone = document.getElementById("nfc-text");
    const mainpage_or = document.getElementById("or");
    const mainpage_use_tablet = document.getElementById("tablet-text");
    const mainpage_cloud = document.getElementById("cloud");
    const mainpage_settings = document.getElementById("settings");


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
        mainpage_cloud.innerHTML = "Cloud-Zugriff"
    }

    if(mainpage_settings) {
        mainpage_settings.innerHTML = "Admin-Einstellungen"
    }
}