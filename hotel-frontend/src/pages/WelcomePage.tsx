import { useState } from "react";
import { Link } from "react-router-dom";

function WelcomePage() {
  const [form, setForm] = useState({
    location: "",
    start_date: "",
    end_date: "",
    guest_count: 1,
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentsByHotel, setCommentsByHotel] = useState<{ [id: number]: any[] }>({});
  const [expandedHotelId, setExpandedHotelId] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8001/api/v1/search/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async (hotelId: number, hotelName: string) => {
    if (expandedHotelId === hotelId) {
      setExpandedHotelId(null);
      return;
    }
    if (!commentsByHotel[hotelId]) {
      try {
        const res = await fetch(`http://localhost:8003/api/v1/comments/${hotelName}`);
        const data = await res.json();
        setCommentsByHotel(prev => ({ ...prev, [hotelId]: data.comments || [] }));
      } catch (err) {
        console.error("Comment fetch error", err);
      }
    }
    setExpandedHotelId(hotelId);
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <h1 style={{ fontSize: "28px", margin: 0, color: "#333" }}>🏨 Hotel Booking</h1>
        <Link
          to="/login"
          style={{
            padding: "8px 18px",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Login
        </Link>
      </header>

      {/* HERO SECTION */}
      <div
        style={{
          backgroundColor: "#555",
          color: "white",
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "32px", margin: 0 }}>Welcome to Hotel Booking</h2>
        <p style={{ fontSize: "16px", marginTop: "10px", opacity: 0.8 }}>
          Book your perfect stay in seconds 🧳
        </p>
      </div>

      {/* SEARCH FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "#fff",
          maxWidth: "600px",
          margin: "40px auto",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 0 12px rgba(0,0,0,0.05)",
          display: "grid",
          gap: 16,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", color: "#333" }}>
          Destination
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter a city or location"
            required
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", color: "#333" }}>
          Check-in Date
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", color: "#333" }}>
          Check-out Date
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", fontWeight: "bold", color: "#333" }}>
          Guest Count
          <input
            type="number"
            name="guest_count"
            value={form.guest_count}
            onChange={handleChange}
            min={1}
            required
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
        </label>

        <button
          type="submit"
          style={{
            padding: 12,
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "Searching..." : "🔍 Search Hotels"}
        </button>
      </form>

      {/* SEARCH RESULTS */}
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          padding: "0 20px",
          maxHeight: "500px",
          overflowY: "auto",
          borderRadius: 10,
          boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)",
          backgroundColor: "#f9f9f9",
        }}
      >
        {results.map(hotel => (
          <div
            key={hotel.id}
            style={{
              backgroundColor: "#fff",
              borderRadius: 10,
              padding: 20,
              margin: "20px 0",
              boxShadow: "0 0 10px rgba(0,0,0,0.05)",
            }}
          >
            <h3>{hotel.hotel_name}</h3>
            <p>📍 {hotel.location}</p>
            <p>🛏️ Room: {hotel.room_type} | Rooms: {hotel.room_count} | 👥 Capacity: {hotel.capacity}</p>
            <p>📅 {hotel.start_date} → {hotel.end_date}</p>
            <p>💰 Price/Night: <strong>${hotel.price_per_night}</strong></p>
            <p>🧾 Total: <strong>${hotel.final_price}</strong></p>

            <div style={{ display: "flex", gap: "10px", marginTop: 12 }}>
              <button
                onClick={() => toggleComments(hotel.id, hotel.hotel_name)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 16px",
                  cursor: "pointer",
                }}
              >
                💬 {expandedHotelId === hotel.id ? "Hide Comments" : "View Comments"}
              </button>
              <button
                style={{
                  backgroundColor: "#ccc",
                  color: "#333",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 16px",
                  cursor: "not-allowed",
                }}
                disabled
              >
                🔒 Login to Book
              </button>
            </div>

            {expandedHotelId === hotel.id && commentsByHotel[hotel.id] && (
              <div
                style={{
                  marginTop: 20,
                  background: "#f8f8f8",
                  borderRadius: 6,
                  padding: 16,
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                <h4 style={{ marginBottom: 10 }}>User Comments</h4>
                {commentsByHotel[hotel.id].length === 0 ? (
                  <p style={{ fontStyle: "italic", color: "#666" }}>No comments yet.</p>
                ) : (
                  commentsByHotel[hotel.id].map((c, idx) => (
                    <div key={idx} style={{ marginBottom: 12, borderBottom: "1px solid #ddd", paddingBottom: 8 }}>
                      <strong>{"⭐".repeat(c.rating)}</strong> — {c.comment}
                      <br />
                      <small style={{ color: "#888" }}>{new Date(c.created_at).toLocaleDateString()}</small>
                    </div>
                  ))
                )}
                <p style={{ marginTop: 12, fontStyle: "italic", color: "#777" }}>
                  🔐 Login to leave a comment
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WelcomePage;
