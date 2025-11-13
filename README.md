# Asset Tracker System

A real-time vehicle tracking system with performance monitoring capabilities, built with SvelteKit and designed for SARA-R5/STM32F hardware integration.

## Features

### Implemented

- **Live Map Dashboard** - Real-time vehicle position tracking on interactive maps
- **Performance Metrics** - Speed, G-force, and acceleration monitoring
- **Fleet Overview** - Monitor multiple vehicles simultaneously
- **Visual Alerts** - Color-coded indicators for harsh braking and rapid acceleration
- **RESTful API** - Endpoints for telemetry data ingestion
- **Database Schema** - PostgreSQL tables for vehicles and telemetry data

### Stack

- **Frontend**: SvelteKit + TypeScript
- **Maps**: MapLibre GL JS (with svelte-maplibre)
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS
- **Authentication**: Lucia (ready for integration)
- **Hosting**: Cloudflare-ready

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start PostgreSQL (via Docker)
npm run db:start

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Access Points

- **Main Page**: http://localhost:5173
- **Dashboard**: http://localhost:5173/dashboard
- **API Endpoints**:
  - POST `/api/telemetry` - Submit telemetry data
  - GET `/api/telemetry` - Get latest telemetry
  - GET `/api/vehicles` - List vehicles
  - POST `/api/vehicles` - Add new vehicle

## Hardware Integration

### SARA-R5 Module

- LTE Cat M1/NB-IoT connectivity
- Integrated GNSS (GPS/GLONASS/Galileo)
- AT command interface
- MQTT/HTTP support

### STM32F MCU

- Handles sensor data collection
- Communicates with SARA-R5 via UART
- Processes accelerometer data for G-force calculations
- Manages OBD2 interface (future)

### Data Flow

1. STM32F collects sensor data (GPS, accelerometer, OBD2)
2. Data packaged and sent to SARA-R5
3. SARA-R5 transmits via LTE to server
4. Server processes and stores in PostgreSQL
5. Dashboard displays real-time updates

## Performance Thresholds

- **Normal Driving**: < 0.3g acceleration
- **Rapid Acceleration**: 0.3g - 0.4g
- **Harsh Braking**: > 0.4g
- **Update Interval**: 2 seconds (adjustable)

## API Documentation

See [TELEMETRY_API.md](docs/TELEMETRY_API.md) for detailed API documentation.

## Database Schema

### Vehicles Table

- `id` - Unique identifier
- `name` - Vehicle display name
- `type` - Vehicle type (truck/car/van)
- `plate` - License plate
- `imei` - Device IMEI
- `active` - Active status

### Telemetry Table

- `id` - Record ID
- `vehicleId` - Reference to vehicle
- `timestamp` - Data timestamp
- `latitude/longitude` - GPS coordinates
- `speed` - Vehicle speed (km/h)
- `heading` - Direction (degrees)
- `accelerationX/Y/Z` - 3-axis acceleration
- `gForce` - Calculated G-force
- `engineData` - OBD2 data (JSON)

## Next Steps

### Immediate Priorities

- [ ] Integrate with Supabase for real-time updates
- [ ] Add authentication with Lucia
- [ ] Implement geofencing alerts
- [ ] Add historical playback feature
- [ ] Create driver behavior analytics

### Hardware Development

- [ ] Finalize STM32F firmware
- [ ] Implement OBD2 reading
- [ ] Add battery backup support
- [ ] Design PCB for production

### Advanced Features

- [ ] Route optimization
- [ ] Fuel consumption tracking
- [ ] Maintenance scheduling
- [ ] Driver scoring system
- [ ] Mobile app development

## Development Notes

### Testing with Mock Data

The dashboard currently uses simulated data that updates every 2 seconds. This demonstrates:

- Real-time position updates
- Speed variations
- G-force changes
- Multiple vehicle tracking

### Production Considerations

1. Enable HTTPS for secure communication
2. Implement rate limiting on API endpoints
3. Add authentication middleware
4. Set up monitoring and logging
5. Configure backup strategies
6. Implement data retention policies

## Resources

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js/docs/)
- [SARA-R5 AT Commands Manual](https://www.u-blox.com/en/docs/UBX-19047455)
- [STM32F HAL Documentation](https://www.st.com/en/embedded-software/stm32cube-mcu-mpu-packages.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## License

Private - SUDOCORP Internal Use Only
