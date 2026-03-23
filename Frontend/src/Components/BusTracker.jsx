// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// /*
//   BusTracker — shows live current stop status of a bus
//   Props:
//     busId      — the bus to track
//     busName    — display name
//     busNumber  — display number
//     autoRefresh — poll every N seconds (default 20)
// */
// const BusTracker = ({ busId, busName, busNumber, autoRefresh = 20 }) => {
//     const [trackData, setTrackData] = useState(null);
//     const [stops, setStops] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [lastUpdated, setLastUpdated] = useState(null);

//     const fetchTrack = () => {
//         axios.get(`http://localhost:3002/api/bus/${busId}/current-stop`)
//             .then(res => {
//                 setTrackData(res.data);
//                 // setLastUpdated(new Date());
//                 setLoading(false);
//             })
//             .catch(() => setLoading(false));
//     };

//     const fetchStops = () => {
//         axios.get(`http://localhost:3002/api/bus/${busId}/route-stops`)
//             .then(res => setStops(res.data || []))
//             .catch(() => setStops([]));
//     };

//     useEffect(() => {
//         fetchTrack();
//         fetchStops();
//         const interval = setInterval(fetchTrack, autoRefresh * 1000);
//         return () => clearInterval(interval);
//     }, [busId]);

//     if (loading) return (
//         <div className="tracker-loading">
//             <span>🚌</span> Loading live status...
//         </div>
//     );

//     const currentOrder = trackData?.current_stop_order ?? null;
//     const currentName  = trackData?.current_stop_name ?? null;

//     // find next stop
//     const nextStop = stops.find(s => s.stop_order === currentOrder + 1);

//     return (
//         <div className="bus-tracker-card">
//             <div className="tracker-header">
//                 <div className="tracker-bus-info">
//                     <span className="tracker-bus-icon">🚌</span>
//                     <div>
//                         <strong>{busName}</strong>
//                         <small>{busNumber}</small>
//                     </div>
//                 </div>
//                 <div className="tracker-live-dot">
//                     <span className={`live-dot ${currentName ? 'active' : 'inactive'}`}></span>
//                     <span className="live-label">{currentName ? 'LIVE' : 'No Update'}</span>
//                 </div>
//             </div>

//             {currentName ? (
//                 <div className="tracker-status">
//                     <div className="tracker-current">
//                         <span className="tcs-label">📍 Current Stop</span>
//                         <span className="tcs-name">{currentName}</span>
//                     </div>
//                     {nextStop && (
//                         <div className="tracker-next">
//                             <span className="tcs-label">⏭️ Next Stop</span>
//                             <span className="tcs-name next">{nextStop.stop_name}</span>
//                             {nextStop.arrival_time && <small>Expected: {nextStop.arrival_time}</small>}
//                         </div>
//                     )}
//                     {!nextStop && currentOrder >= stops.length && (
//                         <div className="tracker-next">
//                             <span className="tcs-label">🏁 Status</span>
//                             <span className="tcs-name">Reached final stop</span>
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 <div className="tracker-no-update">
//                     <p>Driver hasn't marked a stop yet today.</p>
//                 </div>
//             )}

//             {/* Mini stop timeline */}
//             {stops.length > 0 && (
//                 <div className="tracker-timeline">
//                     {stops.map(stop => {
//                         const isPassed  = currentOrder !== null && stop.stop_order < currentOrder;
//                         const isCurrent = stop.stop_order === currentOrder;
//                         const isNext    = stop.stop_order === currentOrder + 1;
//                         return (
//                             <div key={stop.id} className={`tl-stop 
//                                 ${isCurrent ? 'tl-current' : ''}
//                                 ${isPassed  ? 'tl-passed'  : ''}
//                                 ${isNext    ? 'tl-next'    : ''}`}>
//                                 <div className="tl-dot" />
//                                 <span className="tl-name">{stop.stop_name}</span>
//                                 {isCurrent  && <span className="tl-badge here">HERE</span>}
//                                 {isNext     && <span className="tl-badge next">NEXT</span>}
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             {lastUpdated && (
//                 <p className="tracker-updated">
//                     🕐 Updated: {lastUpdated.toLocaleTimeString()}
//                     <button className="refresh-btn" onClick={fetchTrack}>↻</button>
//                 </p>
//             )}
//         </div>
//     );
// };

// export default BusTracker;