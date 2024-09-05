export function lang_en() {
    const mainpage_connect_phone = document.getElementById("nfc-text");
    const mainpage_or = document.getElementById("or");
    const mainpage_use_tablet = document.getElementById("tablet-text");
    const mainpage_cloud = document.getElementById("cloud");
    const mainpage_settings = document.getElementById("settings");

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
        mainpage_cloud.innerHTML = "Cloud Access"
    }

    if(mainpage_settings) {
        mainpage_settings.innerHTML = "Admin Settings"
    }
}