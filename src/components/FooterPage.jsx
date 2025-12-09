import React from "react";
import { Box, Grid, Typography, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";

const FooterPage = () => {
  const navigate = useNavigate();

  // Scroll to top when navigating
  const handleLinkClick = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        bgcolor: "#111",
        color: "#fff",
        mt: 8,
        py: 5,
        px: { xs: 2, sm: 4, md: 10 },
      }}
    >
      <Grid container spacing={4}>
        {/* 🛍 Brand Info */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" fontWeight="bold" mb={1} color="#FFD700">
            🛒 MAN's Clothing
          </Typography>
          <Typography variant="body2" color="#ccc">
            Your one-stop shop for quality and affordable products.
          </Typography>
        </Grid>

        {/* 📚 Quick Links */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" fontWeight="bold" mb={1} color="#FFD700">
            Quick Links
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
            <Typography
              sx={{
                color: "#fff",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => handleLinkClick("/")}
            >
              Home
            </Typography>
            <Typography
              sx={{
                color: "#fff",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => handleLinkClick("/")}
            >
              Products
            </Typography>
            <Typography
              sx={{
                color: "#fff",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => handleLinkClick("/cart")}
            >
              Cart
            </Typography>
            <Typography
              sx={{
                color: "#fff",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
              onClick={() => handleLinkClick("/wishlist")}
            >
              Wishlist
            </Typography>
          </Box>
        </Grid>

        {/* 📞 Contact */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" fontWeight="bold" mb={1} color="#FFD700">
            Contact Us
          </Typography>
          <Typography variant="body2" color="#ccc">
            📍 MAN Clothing Street,Central,Trichy
          </Typography>
          <Typography variant="body2" color="#ccc">
            📞 +91 98765 43210
          </Typography>
          <Typography variant="body2" color="#ccc">
            ✉️ support@manclothiong.com
          </Typography>
        </Grid>

        {/* 🌐 Social Media */}
        <Grid item xs={12} sm={6} md={3}>
          <Typography variant="h6" fontWeight="bold" mb={1} color="#FFD700">
            Follow Us
          </Typography>
          <Box>
            <IconButton
              component="a"
              href="https://facebook.com"
              target="_blank"
              sx={{ color: "#FFD700" }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://twitter.com"
              target="_blank"
              sx={{ color: "#FFD700" }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://instagram.com"
              target="_blank"
              sx={{ color: "#FFD700" }}
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              component="a"
              href="https://youtube.com"
              target="_blank"
              sx={{ color: "#FFD700" }}
            >
              <YouTubeIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      {/* 🔹 Bottom Bar */}
      <Box
        sx={{
          borderTop: "1px solid #333",
          textAlign: "center",
          mt: 4,
          pt: 2,
        }}
      >
        <Typography variant="body2" color="#FFD700">
          © {new Date().getFullYear()} ShopEasy. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default FooterPage;
