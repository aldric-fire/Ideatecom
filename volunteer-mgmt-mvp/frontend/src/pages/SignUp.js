import { useState } from "react";

export default function SignUp() {
  const [form, setForm] = useState({ name: "", age: "", skills: "", role: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted profile:", form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Volunteer Sign Up</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="age" placeholder="Age" onChange={handleChange} />
      <input name="skills" placeholder="Skills" onChange={handleChange} />
      <select name="role" onChange={handleChange}>
        <option value="">Preferred Role</option>
        <option value="cycling-buddy">Cycling Buddy</option>
        <option value="mechanic">Mechanic</option>
        <option value="event-helper">Event Helper</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}
