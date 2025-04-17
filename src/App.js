// src/App.jsx
import React, { useState, useEffect } from "react";
import CityScene from "./page/CityScene";
import stompClient from "./socket";

const carColors = ["blue", "red", "green", "yellow"];

const App = () => {
  const [email, setEmail] = useState("");
  const [entered, setEntered] = useState(false);
  const [carColor, setCarColor] = useState(carColors[0]);

  const handleEnter = () => {
    if (!email.trim()) return;
    localStorage.setItem("userEmail", email);
    setEntered(true);
  };

  useEffect(() => {
    if (entered) stompClient.activate();
    return () => stompClient.deactivate();
  }, [entered]);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {!entered ? (
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "center", alignItems: "center",
          height: "100%", background: "#111", color: "white"
        }}>
          <h1>🚗 Car City</h1>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding: 10, borderRadius: 5, border: "none" }}
          />
          <div style={{ margin: "15px 0", display: "flex", gap: 10 }}>
            {carColors.map(c => (
              <button
                key={c}
                onClick={() => setCarColor(c)}
                style={{
                  backgroundColor: c,
                  color: "white",
                  padding: "10px 14px",
                  borderRadius: 5,
                  border: carColor === c ? "2px solid white" : "none",
                  cursor: "pointer",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <button
            onClick={handleEnter}
            style={{
              padding: "10px 20px",
              background: "#00ff99",
              border: "none",
              borderRadius: 5,
              cursor: "pointer",
            }}
          >
            Enter City
          </button>
        </div>
      ) : (
        <CityScene
          email={email}
          carColor={carColor}
        />
      )}
    </div>
  );
};

export default App;
