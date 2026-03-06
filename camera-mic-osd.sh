#!/bin/bash

DEVICE=$(grep -A 4 "Samsung Galaxy Book Camera Lens Cover" /proc/bus/input/devices | grep -o "event[0-9]\+" | head -n 1)

if [ -z "$DEVICE" ]; then
    echo "Device not found."
    exit 1
fi

# Temporary file to save notification ID
ID_FILE="/tmp/privacy_osd_id"

# Function to instantanely manage the pop-up
show_popup() {
    local STATE="$1"
    local ICON="$2"
    
    if [ -f "$ID_FILE" ]; then
        OLD_ID=$(cat "$ID_FILE")
        # Use -r to override the old ID
        NEW_ID=$(notify-send "Privacy Mode" "$STATE" \
            -i "$ICON" \
	    -u normal \
            -h string:x-canonical-private-synchronous:privacy_osd \
            -h int:transient:1 \
	    -t 400 \
            -p -r "$OLD_ID" 2>/dev/null)
    fi

    # If fail (es. ID no more valid) or at first boot, create a new pop-up
    if [ -z "$NEW_ID" ]; then
        NEW_ID=$(notify-send "Privacy Mode" "$STATE" \
            -i "$ICON" \
	    -u normal \
            -h string:x-canonical-private-synchronous:privacy_osd \
            -h int:transient:1 \
            -t 400 \
            -p)
    fi
    
    # Save new ID
    echo "$NEW_ID" > "$ID_FILE"
}

# Listen for the event
symbol="camera-web-symbolic"

evtest "/dev/input/$DEVICE" | while read -r line; do
    if [[ "$line" == *"type 5 (EV_SW), code 9 (SW_CAMERA_LENS_COVER), value 1"* ]]; then
        show_popup "Off" "$symbol"
            
    elif [[ "$line" == *"type 5 (EV_SW), code 9 (SW_CAMERA_LENS_COVER), value 0"* ]]; then
        show_popup "On" "$symbol"
    fi
done
