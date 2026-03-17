#!/bin/bash

sleep 10

DEVICE=$(grep -A 4 "Samsung Galaxy Book Camera Lens Cover" /proc/bus/input/devices | grep -o "event[0-9]\+" | head -n 1)

if [ -z "$DEVICE" ]; then
    echo "Device not found."
    exit 1
fi

# Temporary file to save notification ID
ID_FILE="/tmp/privacy_osd_id"

# Temporary file to save current state
CURRENT_STATE_FILE="/tmp/current_state_privacy_osd"

# Set symbol
symbol="camera-web-symbolic"

# Function to instantanely manage the pop-up
show_popup() {
    local STATE="$1"
    local ICON="$2"
    local TIME="$3"
    
    if [ -f "$ID_FILE" ]; then
        OLD_ID=$(cat "$ID_FILE")
        # Use -r to override the old ID
        NEW_ID=$(notify-send "Privacy Mode" "$STATE" \
            -i "$ICON" \
	        -u normal \
            -h string:x-canonical-private-synchronous:privacy_osd \
            -h int:transient:1 \
	        -t "$TIME" \
            -p -r "$OLD_ID" 2>/dev/null)
    fi

    # If fail (es. ID no more valid) or at first boot, create a new pop-up
    if [ -z "$NEW_ID" ]; then
        NEW_ID=$(notify-send "Privacy Mode" "$STATE" \
            -i "$ICON" \
	        -u normal \
            -h string:x-canonical-private-synchronous:privacy_osd \
            -h int:transient:1 \
            -t "$TIME" \
            -p)
    fi
    
    # Save new ID
    echo "$NEW_ID" > "$ID_FILE"
}


# Read the value of the actual state
if [ -f "$CURRENT_STATE_FILE" ]; then
	CURRENT_STATE=$(cat "$CURRENT_STATE_FILE")
else
	CURRENT_STATE=0
fi

# Show login message
if [ "$CURRENT_STATE" -eq 0 ]; then
    show_popup "Your camera and microphone are currently ON. Remember to turn them off if not needed." "$symbol" 3000
else 
    show_popup "Your camera and microphone are currently OFF. No one can see or hear you at the moment." "$symbol" 3000
fi

# Save current state
echo "$CURRENT_STATE" > "$CURRENT_STATE_FILE"

evtest "/dev/input/$DEVICE" | while read -r line; do
    if [[ "$line" == *"type 5 (EV_SW), code 9 (SW_CAMERA_LENS_COVER), value 1"* ]]; then
        show_popup "Off" "$symbol" 1000
	    echo 1 > "$CURRENT_STATE_FILE"
            
    elif [[ "$line" == *"type 5 (EV_SW), code 9 (SW_CAMERA_LENS_COVER), value 0"* ]]; then
        show_popup "On" "$symbol" 1000
	    echo 0 > "$CURRENT_STATE_FILE"
    fi
done

