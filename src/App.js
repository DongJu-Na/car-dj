import React, { useState } from "react";
import CityScene from "./page/CityScene";

const carTextures = [
  "/textures/car_texture_blue.jpg",
  "/textures/car_texture_red.jpg",
  "/textures/car_texture_green.jpg",
  "/textures/car_texture_yellow.jpg",
];

const App = () => {
  const [email, setEmail] = useState("");
  const [entered, setEntered] = useState(false);
  const [selectedTextureIndex, setSelectedTextureIndex] = useState(0);

  const handleEnter = () => {
    if (email.trim()) {
      localStorage.setItem("userEmail", email);
      setEntered(true);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {!entered ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            background: "#111",
            color: "white",
          }}
        >
          <h1>🚗 Car City</h1>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", borderRadius: "5px", border: "none" }}
          />

          <div style={{ margin: "15px 0", display: "flex", gap: "10px" }}>
            {carTextures.map((_, index) => {
              const colorName = ["blue", "red", "green", "yellow"][index];
              return (
                <button
                  key={colorName}
                  onClick={() => setSelectedTextureIndex(index)}
                  style={{
                    backgroundColor: colorName,
                    color: "white",
                    padding: "10px 14px",
                    borderRadius: "5px",
                    border: selectedTextureIndex === index ? "2px solid white" : "none",
                    cursor: "pointer",
                  }}
                >
                  {colorName}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleEnter}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              background: "#00ff99",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Enter City
          </button>
        </div>
      ) : (
        <CityScene email={email} textureUrl={carTextures[selectedTextureIndex]} />
      )}
    </div>
  );
};

export default App;
