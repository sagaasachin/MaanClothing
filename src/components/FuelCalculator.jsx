// FuelCalculator.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const FuelCalculator = () => {
  const [mileage, setMileage] = useState("");
  const [distance, setDistance] = useState("");
  const [fuelNeeded, setFuelNeeded] = useState(null);
  const [petrolPrice, setPetrolPrice] = useState(100);
  const [cost, setCost] = useState(null);
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [inputType, setInputType] = useState("manual"); // manual or gmaps
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  const [error, setError] = useState("");

  const calculateFuel = (distKm) => {
    if (!mileage || Number(mileage) <= 0 || !distKm || Number(distKm) <= 0) {
      setError("Enter valid mileage and distance");
      setFuelNeeded(null);
      setCost(null);
      return;
    }
    const fuel = Number(distKm) / Number(mileage);
    setFuelNeeded(Number(fuel.toFixed(2)));
    setCost(Number((fuel * Number(petrolPrice)).toFixed(2)));
    setError("");
  };

  const handleManualFuel = () => {
    const d = parseFloat(distance);
    if (isNaN(d) || d <= 0) {
      setError("Enter a valid distance (km)");
      return;
    }
    setDistanceText(`${d} km`);
    setDurationText("");
    calculateFuel(d);
  };

  const handleFuelViaMap = async () => {
    if (!mileage || Number(mileage) <= 0) {
      setError("Enter valid mileage first");
      return;
    }

    if (!startLocation.trim() || !endLocation.trim()) {
      setError("Enter both start and end location strings");
      return;
    }

    try {
      // Adjust port/host if your backend runs elsewhere
      const res = await axios.get("http://localhost:5000/distance", {
        params: {
          origin: startLocation,
          destination: endLocation,
          mode: "driving",
        },
        timeout: 15000,
      });

      if (res.data && typeof res.data.distance === "number") {
        const distKm = res.data.distance;
        setDistance(distKm.toFixed(2));
        setDistanceText(res.data.distanceText || `${distKm.toFixed(2)} km`);
        setDurationText(res.data.duration || "");
        calculateFuel(distKm);
        setError("");
      } else {
        setError("Distance not returned from backend");
      }
    } catch (err) {
      console.error("Error fetching distance:", err?.response?.data || err.message || err);
      const msg = err?.response?.data?.error || "Error fetching distance from backend";
      setError(msg);
    }
  };

  return (
    <Box sx={{ maxWidth: 520, mx: "auto", mt: 5, px: 2 }}>
      <Card elevation={6}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            <DirectionsCarIcon fontSize="large" /> Fuel Calculator
          </Typography>

          <TextField
            label="Mileage (km per litre)"
            variant="outlined"
            fullWidth
            type="number"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            placeholder="e.g., 18"
            margin="normal"
          />

          <TextField
            label="Petrol Price per litre (₹)"
            variant="outlined"
            fullWidth
            type="number"
            value={petrolPrice}
            onChange={(e) => setPetrolPrice(e.target.value)}
            placeholder="e.g., 100"
            margin="normal"
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Distance Input Type</InputLabel>
            <Select
              value={inputType}
              label="Distance Input Type"
              onChange={(e) => setInputType(e.target.value)}
            >
              <MenuItem value="manual">Manual Entry</MenuItem>
              <MenuItem value="gmaps">Google Maps (via backend)</MenuItem>
            </Select>
          </FormControl>

          {inputType === "manual" && (
            <>
              <TextField
                label="Distance (km)"
                variant="outlined"
                fullWidth
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g., 120"
                margin="normal"
              />
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleManualFuel}>
                Calculate Fuel
              </Button>
            </>
          )}

          {inputType === "gmaps" && (
            <>
              <Typography variant="h6" align="center" sx={{ mt: 1 }}>
                <MyLocationIcon /> Enter Start & End Locations (text)
              </Typography>

              <TextField
                label="Start Location (text)"
                variant="outlined"
                fullWidth
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                placeholder="e.g., Chennai, Tamil Nadu"
                margin="normal"
              />

              <TextField
                label="End Location (text)"
                variant="outlined"
                fullWidth
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                placeholder="e.g., Bengaluru, Karnataka"
                margin="normal"
              />

              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={handleFuelViaMap}
              >
                Calculate Fuel via Google Maps
              </Button>
            </>
          )}

          {fuelNeeded !== null && (
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Fuel Needed: {fuelNeeded} litres
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                Estimated Cost: ₹{cost}
              </Typography>
              {distanceText && (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Distance: {distanceText} {durationText ? `| Time: ${durationText}` : ""}
                </Typography>
              )}
            </Box>
          )}

          {error && (
            <Typography variant="body1" color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default FuelCalculator;
