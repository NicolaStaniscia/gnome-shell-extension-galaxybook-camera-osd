# Samsung Galaxy Book Camera/Mic OSD Fix

A GNOME Shell extension that restores the missing On-Screen Display (OSD) and system notifications for the hardware camera/microphone privacy switch (`block_recording`) on Samsung Galaxy Book laptops.

When you press the dedicated hardware key to disable or enable the camera and microphone, GNOME natively doesn't show any visual feedback. This extension monitors the kernel module in real-time and triggers the standard GNOME OSD, letting you know exactly when your privacy mode is ON or OFF.

## Prerequisites

Before installing, make sure your kernel has the `samsung-galaxybook` driver loaded. You can verify this by checking if the following directory exists on your system:

```bash
ls /sys/class/firmware-attributes/samsung-galaxybook
```

If the directory exists, your system is supported and the extension will work.

## Installation

The user-level extension directory (`~/.local/share/gnome-shell/extensions/`) is the standard path across all Linux distributions using GNOME (Fedora, Ubuntu, Arch Linux, etc.).

### 1. Clone the repository
Download the files to your local machine:
```bash
git clone https://github.com/NicolaStaniscia/gnome-shell-extension-galaxybook-camera-osd.git
```

### 2. Move the folder
For GNOME to recognize the extension, the directory name **must** exactly match the extension's UUID.
```bash
cp -r galaxybook-camera-osd@nicolastaniscia.github.com ~/.local/share/gnome-shell/extensions/galaxybook-camera-osd@nicolastaniscia.github.com
```

### 3. Restart your session
Since modern GNOME uses Wayland by default, you need to restart your session for the new extension files to be detected:
* Log out of your current user session and log back in.

### 4. Enable the extension
You can enable the extension using the **Extensions** app (available in your software center), or simply run the following command in your terminal:
```bash
gnome-extensions enable galaxybook-camera-osd@nicolastaniscia.github.com
```