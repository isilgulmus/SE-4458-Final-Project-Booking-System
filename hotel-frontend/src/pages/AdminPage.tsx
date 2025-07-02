import { useEffect, useState } from "react";

const API = "http://localhost:8000/api/v1/rooms";
const NOTIF_API = "http://localhost:8000/api/v1/notifications";

function AdminPage() {
  const [rooms, setRooms] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    hotel_name: "",
    location: "",
    capacity: 1,
    room_type: "",
    room_count: 1,
    price_per_night: 0,
    start_date: "",
    end_date: "",
  });

  const token = localStorage.getItem("token");

  const fetchRooms = async () => {
    const res = await fetch(API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRooms(data.items || []);
  };

  const fetchNotifications = async () => {
    const res = await fetch(NOTIF_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setNotifications(data.notifications || []);
  };

  useEffect(() => {
    fetchRooms();
    fetchNotifications();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `${API}/${editingId}` : API;

    await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setForm({
      hotel_name: "",
      location: "",
      capacity: 1,
      room_type: "",
      room_count: 1,
      price_per_night: 0,
      start_date: "",
      end_date: "",
    });

    setEditingId(null);
    await fetchRooms();
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchRooms();
  };

  const handleEdit = (room: any) => {
    setForm({
      hotel_name: room.hotel_name,
      location: room.location,
      capacity: room.capacity,
      room_type: room.room_type,
      room_count: room.room_count,
      price_per_night: room.price_per_night,
      start_date: room.start_date,
      end_date: room.end_date,
    });
    setEditingId(room.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        padding: "40px 20px",
        fontFamily: "'Segoe UI', sans-serif",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>
        🛠 Admin Panel – Manage Rooms
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px",
          marginBottom: "50px",
          backgroundColor: "#fdfdfd",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        {Object.entries(form).map(([key, value]) => (
          <div key={key} style={{ display: "flex", flexDirection: "column" }}>
            <label style={{ fontWeight: "bold", marginBottom: "5px" }}>
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
            <input
              type={
                key.includes("date")
                  ? "date"
                  : typeof value === "number"
                  ? "number"
                  : "text"
              }
              name={key}
              value={value}
              onChange={handleChange}
              required
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
        ))}
        <div style={{ gridColumn: "span 2", textAlign: "center" }}>
          <button
            type="submit"
            style={{
              padding: "12px 24px",
              backgroundColor: editingId ? "#ffc107" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              width: "200px",
            }}
          >
            {editingId ? "✏️ Update Room" : "➕ Add Room"}
          </button>
        </div>
      </form>

      <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Current Rooms
      </h3>

      <div
        style={{
          maxHeight: "340px",
          overflowY: "auto",
          paddingRight: "6px",
          background: "#fafafa",
          borderRadius: "10px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}
      >
        <ul style={{ listStyle: "none", padding: "12px", margin: 0 }}>
          {rooms.map((room: any) => (
            <li
              key={room.id}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <strong>{room.hotel_name}</strong> in {room.location} — {" "}
                <em>{room.room_type}</em> | {room.room_count} rooms | $
                {room.price_per_night}/night
              </div>
              <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                <button
                  onClick={() => handleEdit(room)}
                  style={{
                    backgroundColor: "#ffc107",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <h3 style={{ textAlign: "center", margin: "40px 0 20px" }}>📬 Admin Notifications</h3>
      <div
        style={{
          maxHeight: "200px",
          overflowY: "auto",
          background: "#fff",
          padding: "16px",
          borderRadius: "10px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        {notifications.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#888" }}>
            No notifications yet.
          </p>
        ) : (
          notifications.map((notif: any, idx: number) => (
            <div
              key={idx}
              style={{
                borderBottom: "1px solid #eee",
                marginBottom: "10px",
                paddingBottom: "10px",
              }}
            >
              <strong>{notif.hotel}</strong> in {notif.location} booked by <strong>{notif.user}</strong>
              <br />
              <small style={{ color: "#666" }}>{notif.start_date} → {notif.end_date}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPage;
