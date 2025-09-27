export default function Events() {
  const events = [
    { id: 1, name: "Weekend Ride", role: "Cycling Buddy" },
    { id: 2, name: "Bike Repair Workshop", role: "Mechanic" },
  ];

  return (
    <div>
      <h2>Upcoming Events</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            {e.name} – Role: {e.role} <button>Sign Up</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
