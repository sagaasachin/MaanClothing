// src/Components/LandingPage.jsx
import React from "react";
import { Box, Typography, Button, useMediaQuery } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import pic1 from "../assets/pic6.jpg";
import pic2 from "../assets/pic7.jpg";
import pic3 from "../assets/pic8.jpg";

const slides = [
  { src: pic1, caption: "Up to 50% Off on Shirts" },
  { src: pic2, caption: "Buy 1 Get 1 Free - T-Shirts" },
  { src: pic3, caption: "Flat ₹500 Off on Bottom Wear" },
];

const LandingPage = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: !isMobile, // hide arrows on mobile
  };

  return (
    <Box sx={{ position: "relative", mb: 5 }}>
      <Slider {...sliderSettings}>
        {slides.map((s, i) => (
          <Box key={i} sx={{ position: "relative" }}>
            <img
              src={s.src}
              alt={s.caption}
              style={{
                width: "100%",
                height: isMobile ? "45vh" : isTablet ? "65vh" : "90vh",
                objectFit: "cover",
                objectPosition: isMobile ? "center" : "0px -100px",
              }}
            />

            {/* Caption */}
            <Typography
              variant={isMobile ? "body1" : "h6"}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "100%",
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                px: isMobile ? 2 : 3,
                py: isMobile ? 1 : 1.5,
                fontWeight: 500,
                textShadow: "1px 1px 3px #000",
              }}
            >
              {s.caption}
            </Typography>
          </Box>
        ))}
      </Slider>

      {/* Shop Now Button */}
      <Button
        variant="contained"
        onClick={() =>
          window.scrollTo({
            top: 600,
            behavior: "smooth",
          })
        }
        sx={{
          position: "absolute",
          top: isMobile ? "60%" : "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "gold",
          color: "#000",
          fontWeight: "bold",
          px: isMobile ? 2.5 : 4,
          py: isMobile ? 1 : 1.5,
          borderRadius: 2,
          fontSize: isMobile ? "0.8rem" : "1rem",
          boxShadow: 4,
          "&:hover": { bgcolor: "#ffcc00" },
        }}
      >
        Shop Now
      </Button>
    </Box>
  );
};

export default LandingPage;
