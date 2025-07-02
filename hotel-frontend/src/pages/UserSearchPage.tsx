import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define the ChatMessage type strictly
type ChatMessage = {
  role: "user" | "agent";
  content: string;
};

function UserSearchPage() {
  const [form, setForm] = useState({
    location: "",
    start_date: "",
    end_date: "",
    guest_count: 1,
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === "number" ? parseInt(value) : value;
    setForm((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch("http://localhost:8001/api/v1/search/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const token = localStorage.getItem("token") || "";

    const userMessage: ChatMessage = { role: "user", content: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("http://localhost:8005/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: chatInput }),
      });

      const data = await res.json();
      const agentMessage: ChatMessage = {
        role: "agent",
        content: data.message || "⚠️ Sorry, I couldn't understand that.",
      };
      setChatHistory((prev) => [...prev, agentMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        role: "agent",
        content: "❌ Error talking to assistant.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "30px", fontFamily: "'Segoe UI', sans-serif" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "24px" }}>🔍 Search Hotels</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px", marginBottom: "30px" }}>
        {["location", "start_date", "end_date", "guest_count"].map((field) => {
          const type = field === "guest_count" ? "number" : field.includes("date") ? "date" : "text";
          return (
            <label key={field} style={{ display: "flex", flexDirection: "column" }}>
              {field.replace("_", " ").toUpperCase()}
              <input
                type={type}
                name={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
                required
                min={field === "guest_count" ? 1 : undefined}
                style={{ padding: "10px", marginTop: "6px", borderRadius: "6px", border: "1px solid #ccc" }}
              />
            </label>
          );
        })}

        <button type="submit" style={{ padding: "12px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      <h3 style={{ marginBottom: "16px" }}>🔎 Search Results</h3>
      {hasSearched && (results.length === 0 ? <p>No hotels found.</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "500px", overflowY: "auto" }}>
          {results.map((hotel, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
              <h4 style={{ fontSize: "20px", marginBottom: "8px", color: "#222" }}>{hotel.hotel_name}</h4>
              <p style={{ margin: 0, color: "#666" }}>📍 <strong>{hotel.location}</strong></p>
              <p style={{ fontStyle: "italic", margin: "4px 0" }}>🛏 <em>Room Type:</em> {hotel.room_type}</p>
              <p style={{ margin: "4px 0" }}>👥 Capacity: {hotel.capacity} | Rooms: {hotel.room_count}</p>
              <p style={{ margin: "4px 0" }}>📅 {hotel.start_date} → {hotel.end_date}</p>
              <p style={{ margin: "4px 0" }}>💰 Price/Night: <strong>${hotel.price_per_night}</strong></p>
              {hotel.discounted_for && <p style={{ color: "#28a745", fontWeight: "bold", margin: "4px 0" }}>✅ Discounted for {hotel.discounted_for}</p>}
              <p style={{ marginBottom: "12px" }}>🧾 <strong>Total: ${hotel.final_price}</strong></p>
              <button onClick={() => navigate(`/hotel/${hotel.id}`)} style={{ backgroundColor: "#007bff", color: "#fff", padding: "10px 16px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>View & Book</button>
            </div>
          ))}
        </div>
      ))}

      {/* AI Assistant Chat */}
      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0 0 8px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginBottom: "12px" }}>🤖 Ask Hotel Assistant</h3>

        <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "12px", paddingRight: "6px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {chatHistory.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start", backgroundColor: msg.role === "user" ? "#007bff" : "#f1f1f1", color: msg.role === "user" ? "#fff" : "#333", padding: "10px 14px", borderRadius: "18px", maxWidth: "80%", whiteSpace: "pre-wrap" }}>
              {msg.content}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="E.g. Find a hotel in İzmir from August 10 to 12"
            style={{ flexGrow: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
          <button onClick={handleChatSubmit} disabled={chatLoading} style={{ padding: "10px 16px", backgroundColor: "#28a745", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            {chatLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserSearchPage;
