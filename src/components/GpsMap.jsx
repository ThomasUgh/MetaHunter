import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// fix for default marker icon in webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function GpsMap({ latitude, longitude, altitude }) {
  const position = [latitude, longitude]

  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '250px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-gray-800 text-sm">
              <div><strong>Lat:</strong> {latitude.toFixed(6)}</div>
              <div><strong>Lon:</strong> {longitude.toFixed(6)}</div>
              {altitude && <div><strong>Alt:</strong> {altitude.toFixed(1)}m</div>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Coordinates below map */}
      <div className="bg-gray-800 px-3 py-2 text-xs text-gray-400 flex justify-between">
        <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        {altitude && <span>{altitude.toFixed(1)}m altitude</span>}
      </div>
    </div>
  )
}

export default GpsMap
