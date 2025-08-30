// Create a new file: src/components/Footer.jsx

import React from "react";
import { Box, Container, Typography, Link, IconButton } from "@mui/material";
import { GitHub, LinkedIn, Email } from "@mui/icons-material";

function Footer() {
  const socialLinks = {
    github: "https://github.com/MitkumarR", // Your GitHub Profile
    linkedin: "https://linkedin.com/in/MitRohit/", // Your LinkedIn Profile
    email: "mailto:mitkumar2105@gmail.com",
  };
  const repoLink = "https://github.com/mitkumarr/e2ee_share"; // Your Repo Link

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto", // Pushes footer to the bottom
        // backgroundColor: (theme) =>
        //   theme.palette.mode === 'light'
        //     ? theme.palette.grey[200]
        //     : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} E2EE Share — Developed by MitkumarR
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            component={Link}
            href={repoLink}
          >
            Source Code - GitHub Repo
          </Typography>
          <Box>
            <IconButton
              aria-label="GitHub Repository"
              component={Link}
              href={socialLinks.github}
              target="_blank"
              rel="noopener"
            >
              <GitHub />
            </IconButton>
            <IconButton
              aria-label="LinkedIn Profile"
              component={Link}
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener"
            >
              <LinkedIn />
            </IconButton>
            <IconButton
              aria-label="Email"
              component={Link}
              href={socialLinks.email}
            >
              <Email />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
