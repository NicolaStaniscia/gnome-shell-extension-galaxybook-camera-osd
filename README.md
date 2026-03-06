# Samsung Galaxy Book 3 Pro - Camera/Mic On/Off OSD

This repository contains three files to enable the On-Screen Display (OSD) for the Camera and Mic On/Off key on the Samsung Galaxy Book 3 Pro running Fedora 43 Workstation Edition.

## Files:
- **99-samsung-privacy.rules**: contains the udev rule that allows the script to read the Samsung camera lens cover events.
- **samsung-privacy-osd.desktop**: autostarts the script once you log in.
- **camera-mic-osd.sh**: the script that intercepts the event and shows the corresponding pop-up.

## File locations:
- **99-samsung-privacy.rules**: place this file in the `/etc/udev/rules.d/` directory.
- **samsung-privacy-osd.desktop**: place this file in the `$HOME/.config/autostart/` directory.
- **camera-mic-osd.sh**: this file can be placed anywhere, but I recommend putting it in the `$HOME/.local/bin/` directory.