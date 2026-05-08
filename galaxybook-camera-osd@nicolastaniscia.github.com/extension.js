import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

// CONSTANTS
const KERNEL_OBJECT_PATH = '/sys/class/firmware-attributes/samsung-galaxybook/attributes/block_recording/current_value';
const POLL_INTERVAL_MS = 300;

export default class CameraMicMonitorExtension extends Extension {
    enable() {
        this._lastState = null;
        this._timeoutId = null;

        // Read the initial state when the extension is enabled
        this._checkFirmwareState();
        this._showInitialState();

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, POLL_INTERVAL_MS, () => {
            this._checkFirmwareState();
            
            // Return SOURCE_CONTINUE to keep the timer running
            return GLib.SOURCE_CONTINUE; 
        });
    }

    disable() {
        // Clean resources and reset state
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }
        this._lastState = null;
    }

    _checkFirmwareState() {
        try {
            let file = Gio.File.new_for_path(KERNEL_OBJECT_PATH);
            
            // Read the file
            let [success, contents] = file.load_contents(null);

            if (success) {
                // Convert readed bytes to string and trim whitespace (remove newline)
                let decoder = new TextDecoder('utf-8');
                let currentState = decoder.decode(contents).trim();

                // If file changed, show OSD
                if (this._lastState !== null && currentState !== this._lastState) {
                    this._showOSD(currentState);
                }

                // Save the new state
                this._lastState = currentState;
            }
        } catch (error) {
            // If any error occurs, log it to the console
            console.error(`[CameraMicMonitor] Error during file read: ${error.message}`);
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

    _showInitialState() {
        if (this._lastState === null) {
            console.error('[CameraMicMonitor] Initial state is null');
            return;
        }

        // Get current DBus session
        const bus = Gio.DBus.session;

        // Set notification parameters
        let appName = 'Privacy mode';
        let iconPath = `${this.path}/icons/film-camera-symbolic.svg`; 
        let title = 'Current Camera/Microphone Status';
        let body;
        if (this._lastState === '1') {
            body = 'Your camera and microphone are currently OFF. No one can see or hear you at the moment.';
        } else {
            body = 'Your camera and microphone are currently ON. Remember to turn them off if not needed.';
        }

        // Asyncronous DBus call
        bus.call(
            'org.freedesktop.Notifications',   // DBus bus name 
            '/org/freedesktop/Notifications',  
            'org.freedesktop.Notifications',   
            'Notify',                          // Function name
            new GLib.Variant('(susssasa{sv}i)', [
                appName,                       // App name
                0,                             // Notification ID
                iconPath,                      
                title,                         
                body,                          
                [],                            
                {},                            
                10                              // Timeout (10 seconds)
            ]),
            null,                              // No reply expected
            Gio.DBusCallFlags.NONE,
            -1,                                
            null,
            // Callback function to handle the response
            (connection, result) => {
                try {
                    connection.call_finish(result);
                } catch (e) {
                    console.error(`[CameraMicMonitor] Error during DBus call: ${e.message}`);
                }
            }
        );
    }
}
