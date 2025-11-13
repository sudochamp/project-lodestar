# Telemetry API Documentation

## Overview

This document describes how to send telemetry data from SARA-R5/STM32F hardware to the Asset Tracker system.

## Endpoint

```
POST /api/telemetry
Content-Type: application/json
```

## Request Format

```json
{
	"vehicleId": "veh-001",
	"timestamp": "2024-11-13T10:30:00Z",
	"latitude": 53.3498,
	"longitude": -6.2603,
	"speed": 45.5,
	"heading": 90,
	"altitude": 100,
	"accelerationX": 0.2,
	"accelerationY": -0.1,
	"accelerationZ": 9.8,
	"engineData": {
		"rpm": 2500,
		"coolantTemp": 90,
		"fuelLevel": 75
	}
}
```

## Required Fields

- `vehicleId`: String - Unique identifier of the vehicle
- `latitude`: Number - GPS latitude in decimal degrees
- `longitude`: Number - GPS longitude in decimal degrees

## Optional Fields

- `timestamp`: String/Number - ISO 8601 timestamp or Unix timestamp (defaults to current time)
- `speed`: Number - Speed in km/h
- `heading`: Number - Direction in degrees (0-360)
- `altitude`: Number - Altitude in meters
- `accelerationX`: Number - X-axis acceleration in m/s²
- `accelerationY`: Number - Y-axis acceleration in m/s²
- `accelerationZ`: Number - Z-axis acceleration in m/s² (should be ~9.8 when stationary)
- `engineData`: Object - JSON object containing OBD2 data

## Response Format

### Success

```json
{
	"success": true,
	"data": {
		"id": "uuid",
		"vehicleId": "veh-001",
		"timestamp": "2024-11-13T10:30:00Z",
		"latitude": 53.3498,
		"longitude": -6.2603,
		"speed": 45.5,
		"gForce": 1.02
	}
}
```

### Error

```json
{
	"success": false,
	"error": "Error message"
}
```

## Example Arduino/STM32 Code

```cpp
// Example for sending telemetry via SARA-R5
void sendTelemetry(float lat, float lon, float speed, float ax, float ay, float az) {
    char payload[512];
    sprintf(payload,
        "{\"vehicleId\":\"veh-001\","
        "\"latitude\":%.6f,"
        "\"longitude\":%.6f,"
        "\"speed\":%.1f,"
        "\"accelerationX\":%.2f,"
        "\"accelerationY\":%.2f,"
        "\"accelerationZ\":%.2f}",
        lat, lon, speed, ax, ay, az
    );

    // Send via SARA-R5 AT commands
    sendATCommand("AT+UHTTPC=0,1,\"http://your-server.com/api/telemetry\",\"post.ffs\"");
    sendATCommand("AT+UHTTP=0,9,1,2"); // Set content type to JSON
    sendATCommand(payload);
}
```

## MQTT Alternative (Future)

For real-time updates, MQTT protocol can be used:

- Topic: `telemetry/{vehicleId}`
- QoS: 1 (at least once delivery)
- Retain: false

## Rate Limiting

- Maximum 1 update per second per vehicle
- Batch updates can be sent every 10-30 seconds for better efficiency

## G-Force Calculation

The server automatically calculates G-force from acceleration values:

```
gForce = sqrt(ax² + ay² + az²) / 9.8
```

## Notes for Hardware Integration

1. Ensure GPS has a valid fix before sending location data
2. Filter accelerometer data to reduce noise
3. Use HTTPS in production for secure data transmission
4. Implement local buffering for network outages
5. Consider power management - send data in bursts rather than continuously
