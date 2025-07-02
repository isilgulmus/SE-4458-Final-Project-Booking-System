import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserHotelDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const token = localStorage.getItem("token");

  const [room, setRoom] = useState<any | null>(null);
  const [form, setForm] = useState({
    start_date: "",
    end_date: "",
    guest_count: 1,
  });

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({
    comment: "",
    rating: 5,
  });

  useEffect(() => {
    if (!roomId) return;
    fetch(`http://localhost:8000/api/v1/rooms/${roomId}`)
      .then(res => res.json())
      .then(data => setRoom(data))
      .catch(console.error);
  }, [roomId]);

  useEffect(() => {
    if (room?.hotel_name) {
      fetch(`http://localhost:8003/api/v1/comments/${room.hotel_name}`)
        .then(res => res.json())
        .then(data => setComments(data.comments || []))
        .catch(console.error);
    }
  }, [room?.hotel_name]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8002/api/v1/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: Number(roomId),
          ...form,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("✅ Booking successful!");
    } catch {
      toast.error("❌ Booking failed");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created_at = new Date().toISOString();
      const res = await fetch("http://localhost:8003/api/v1/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hotel_name: room.hotel_name,
          comment: newComment.comment,
          rating: newComment.rating,
          created_at,
        }),
      });
      if (!res.ok) throw new Error();

      const updated = await fetch(`http://localhost:8003/api/v1/comments/${room.hotel_name}`);
      const updatedData = await updated.json();
      setComments(updatedData.comments || []);

      toast.success("💬 Comment added!");
      setNewComment({ comment: "", rating: 5 });
    } catch {
      toast.error("❌ Failed to add comment");
    }
  };

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "40px auto",
        padding: 32,
        backgroundColor: "#fafafa",
        borderRadius: "12px",
        boxShadow: "0 0 20px rgba(0,0,0,0.08)",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <ToastContainer />
      {room ? (
        <>
          <h2 style={{ fontSize: "28px", marginBottom: "6px", color: "#333" }}>
            {room.hotel_name}
          </h2>
          <p style={{ color: "#777", marginBottom: 24 }}>
            📍 <strong>{room.location}</strong>
            <br />
            🛏️ <em>Room Type:</em> {room.room_type}
            <br />
            👥 <strong>Capacity:</strong> {room.capacity} guests
            <br />
            💰 <strong>${room.price_per_night}</strong> per night
          </p>

          <hr style={{ margin: "30px 0", borderColor: "#ddd" }} />

          <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>🔔 Booking</h3>
          <form onSubmit={handleBooking} style={{ display: "grid", gap: 14 }}>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
              required
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
              required
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <input
              type="number"
              min={1}
              value={form.guest_count}
              onChange={(e) => setForm(f => ({
                ...f,
                guest_count: parseInt(e.target.value) || 1
              }))}
              required
              style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#28a745",
                color: "white",
                padding: "12px",
                borderRadius: "6px",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
            >
              Book Now
            </button>
          </form>

          <hr style={{ margin: "40px 0", borderColor: "#ddd" }} />

          <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>💬 User Reviews</h3>
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxHeight: "300px",
            overflowY: "auto",
            paddingRight: "6px"
          }}>
            {comments.map((c, i) => (
              <div
                key={i}
                style={{
                  background: "white",
                  borderRadius: 8,
                  padding: "14px 18px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <strong>{"⭐".repeat(c.rating)}</strong> – {c.comment}
                <br />
                <small style={{ color: "#999" }}>
                  {c.created_at &&
                    new Date(c.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                </small>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCommentSubmit}
            style={{ display: "grid", gap: 12, marginTop: 30 }}
          >
            <textarea
              placeholder="Your comment..."
              value={newComment.comment}
              onChange={(e) => setNewComment(c => ({ ...c, comment: e.target.value }))}
              required
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                resize: "vertical"
              }}
            />
            <select
              value={newComment.rating}
              onChange={(e) => setNewComment(c => ({ ...c, rating: Number(e.target.value) }))}
              style={{
                padding: "10px",
                borderRadius: "6px",
                border: "1px solid #ccc"
              }}
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {"⭐".repeat(r)} ({r})
                </option>
              ))}
            </select>
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "12px",
                borderRadius: "6px",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
            >
              Submit Comment
            </button>
          </form>
        </>
      ) : (
        <p>Loading room details...</p>
      )}
    </div>
  );
}

export default UserHotelDetailPage;
