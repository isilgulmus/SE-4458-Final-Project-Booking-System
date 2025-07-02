import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

function SearchForm() {
  const [form, setForm] = useState({
    location: "",
    start_date: "",
    end_date: "",
    guest_count: 1,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(form); // API POST burada olacak
  };

  return (
    <form onSubmit={handleSubmit} className="container" style={{ marginTop: "30px" }}>
      <input
        type="text"
        name="location"
        placeholder="Destination"
        className="input"
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="start_date"
        className="input"
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="end_date"
        className="input"
        onChange={handleChange}
        required
      />
      <input
        type="number"
        name="guest_count"
        min="1"
        className="input"
        onChange={handleChange}
        required
      />
      <button type="submit" className="button">Search</button>
    </form>
  );
}

export default SearchForm;
