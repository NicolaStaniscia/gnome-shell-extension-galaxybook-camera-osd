# Samsung Galaxy Book 3 Pro - Camera/Mic On/Off OSD

This repository contains three files to enable the On-Screen Display (OSD) for the Camera and Mic On/Off key on the Samsung Galaxy Book 3 Pro running Fedora 43 Workstation Edition.

## How it works & Security
The physical Camera/Mic block key works out of the box at the hardware level. You can verify this by going to **Settings > Audio > Input** and observing the microphone volume indicator. 

However, the system doesn't provide any visual feedback when you press the key. The purpose of this script is simply to show a pop-up notification (OSD) to indicate the current block/unblock status.

**Security Note:** because the key press communicates directly with the hardware, it is not detectable as a standard keyboard input. To trigger the OSD safely, this script listens specifically for the system's "Samsung Galaxy Book Camera Lens Cover" event. This means it does not read or intercept your keyboard inputs, ensuring your system's security remains uncompromised.

## Files:
- **99-samsung-privacy.rules**: contains the udev rule that allows the script to read the Samsung camera lens cover events.
- **samsung-privacy-osd.desktop**: autostarts the script once you log in.
- **camera-mic-osd.sh**: the script that intercepts the event and shows the corresponding pop-up.

## File locations:
- **99-samsung-privacy.rules**: place this file in the `/etc/udev/rules.d/` directory.
- **samsung-privacy-osd.desktop**: place this file in the `$HOME/.config/autostart/` directory.
- **camera-mic-osd.sh**: this file can be placed anywhere, but I recommend putting it in the `$HOME/.local/bin/` directory.