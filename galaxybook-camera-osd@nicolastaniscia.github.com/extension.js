import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

// CONSTANTS
const KERNEL_OBJECT_PATH = '/sys/class/firmware-attributes/samsung-galaxybook/attributes/block_recording/current_value';
const POLL_INTERVAL_MS = 300;

// Asyncronous sleep function 
const sleep = (ms) => new Promise(resolve => {
    GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => {
        resolve();
        return GLib.SOURCE_REMOVE; // Stop the timer after it fires once
    });
});

export default class CameraMicMonitorExtension extends Extension {
    async enable() {
        this._isEnabled = true;
        this._lastState = null;
        this._timeoutId = null;

        // Read the initial state when the extension is enabled
        await this._checkFirmwareState();
        this._showInitialState();

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, POLL_INTERVAL_MS, () => {
            this._checkFirmwareState();
            
            // Return SOURCE_CONTINUE to keep the timer running
            return GLib.SOURCE_CONTINUE; 
        });
    }

    disable() {
        this._isEnabled = false;

        // Clean resources and reset state
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }

        this._lastState = null;
    }

    async _checkFirmwareState() {
        try {
            let file = Gio.File.new_for_path(KERNEL_OBJECT_PATH);
            
            // Read the file
            let [contents] = await file.load_contents_async(null);

            // Convert readed bytes to string and trim whitespace (remove newline)
            let decoder = new TextDecoder('utf-8');
            let currentState = decoder.decode(contents).trim();

            // If file changed, show OSD
            if (this._lastState !== null && currentState !== this._lastState) {
                this._showOSD(currentState);
            }

            // Save the new state
            this._lastState = currentState;
            
        } catch (error) {
            // If any error occurs, log it to the console
            if (this._isEnabled) {
                console.error(`[CameraMicMonitor] Error during file read: ${error.message}`);
            }
        }
    }

    _showOSD(state) {
        let iconPath, message;

        // Show different icons and messages based on the state read from the kernel file
        if (state === '1') {
            iconPath = `${this.path}/icons/film-camera-disabled-symbolic.svg`;
            message = 'Camera/Mic OFF';
        } else {
            iconPath = `${this.path}/icons/film-camera-symbolic.svg`; 
            message = 'Camera/Mic ON';
        }

        // Create a Gio.File object for the icon path
        let file = Gio.File.new_for_path(iconPath);
        
        // Create a Gio.FileIcon from the file
        let icon = Gio.FileIcon.new(file);
        
        // Show the OSD notification
        Main.osdWindowManager._showOsdWindow(Main.layoutManager.primaryIndex, icon, message, null, null);
    }

    async _showInitialState() {
        if (this._lastState === null) {
            console.error('[CameraMicMonitor] Initial state is null');
            return;
        }

        await sleep(5000); // Wait for 5 seconds to ensure the desktop environment is fully loaded and ready to display notifications

        if (this._isEnabled === false) return; // If the extension was disabled during the sleep, do not proceed

        let iconFile = Gio.File.new_for_path(`${this.path}/icons/film-camera-symbolic.svg`); 
        let icon = Gio.FileIcon.new(iconFile);

        // Set notification parameters
        let title = 'Current Camera/Microphone Status';
        let body = (this._lastState === '1') 
            ? 'Your camera and microphone are currently OFF. No one can see or hear you at the moment.'
            : 'Your camera and microphone are currently ON. Remember to turn them off if not needed.';

        // Create and show a new notification
        const systemSource = MessageTray.getSystemSource();
        const notification = new MessageTray.Notification({
            source: systemSource,
            title: title,
            body: body,
            gicon: icon,
            urgency: MessageTray.Urgency.HIGH,
        });

        systemSource.addNotification(notification); 
    }
}
