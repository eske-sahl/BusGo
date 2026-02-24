import { useState } from "react";
import axios from "axios";

const StopForm = ({ routeId }) => {
  const [formData, setFormData] = useState({
    stop_name: "",
    stop_order: "",
    arrival_time: "",
    departure_time: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3002/api/stops/add", {
        route_id: routeId,
        ...formData,
      });

      alert("Stop added ✅");

      setFormData({
        stop_name: "",
        stop_order: "",
        arrival_time: "",
        departure_time: "",
      });
    } catch (error) {
      console.error(error);
      alert("Failed to add stop ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Add Stop</h4>

      <input
        type="text"
        name="stop_name"
        placeholder="Stop name"
        value={formData.stop_name}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="stop_order"
        placeholder="Order"
        value={formData.stop_order}
        onChange={handleChange}
        required
      />

      <input
        type="time"
        name="arrival_time"
        value={formData.arrival_time}
        onChange={handleChange}
        required
      />

      <input
        type="time"
        name="departure_time"
        value={formData.departure_time}
        onChange={handleChange}
        required
      />

      <button type="submit">➕ Add Stop</button>
    </form>
  );
};

export default StopForm;
