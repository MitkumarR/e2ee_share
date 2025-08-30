import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Link,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Paper,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Add,
  Folder,
  Delete,
  Archive,
  RestoreFromTrash,
  DeleteForever,
  MoreVert,
  InsertDriveFile,
  Link as LinkIcon,
  ContentCopy,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import UploadFile from "./UploadFile";
import { generateLinkSecret, wrapFileKey } from "../utils/crypto";
import { getFileKey, clearAllKeys } from "../utils/db";
import { useNavigate } from "react-router-dom";

// Helper to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

function FileRow({ file, onStatusChange, onPermanentDelete, onShare }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAction = (action) => {
    onStatusChange(file.id, action);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this file? This cannot be undone."
      )
    ) {
      onPermanentDelete(file.id);
    }
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        borderBottom: "1px solid #e0e0e0",
        "&:hover": { backgroundColor: "#f5f5f5" },
      }}
    >
      <InsertDriveFile sx={{ mr: 2, color: "grey.600" }} />
      <Typography
        variant="body1"
        sx={{
          flex: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {file.filename}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ flex: 0.5, textAlign: "center" }}
      >
        {formatBytes(file.size)}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ flex: 0.5, textAlign: "center" }}
      >
        {new Date(file.created_at).toLocaleDateString()}
      </Typography>
      <Box sx={{ flex: 0.2, textAlign: "right" }}>
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVert />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          {file.status === "active" && (
            <MenuItem onClick={() => handleAction("trashed")}>
              <Delete sx={{ mr: 1 }} />
              Move to Trash
            </MenuItem>
          )}
          {file.status === "active" && (
            <MenuItem onClick={() => handleAction("archived")}>
              <Archive sx={{ mr: 1 }} />
              Archive
            </MenuItem>
          )}
          {file.status === "trashed" && (
            <MenuItem onClick={() => handleAction("active")}>
              <RestoreFromTrash sx={{ mr: 1 }} />
              Restore
            </MenuItem>
          )}
          {file.status === "trashed" && (
            <MenuItem onClick={handleDelete}>
              <DeleteForever sx={{ mr: 1 }} />
              Delete Forever
            </MenuItem>
          )}
          {file.status === "archived" && (
            <MenuItem onClick={() => handleAction("active")}>
              <RestoreFromTrash sx={{ mr: 1 }} />
              Unarchive
            </MenuItem>
          )}
          {file.status === "active" && (
            <MenuItem
              onClick={() => {
                onShare(file);
                handleMenuClose();
              }}
            >
              <LinkIcon sx={{ mr: 1 }} />
              Share
            </MenuItem>
          )}
        </Menu>
      </Box>
    </Box>
  );
}

function ShareDialog({
  open,
  onClose,
  link,
  expiration,
  onExpirationChange,
  onGenerate,
  generating,
}) {
  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Share File</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Choose how long the link should be valid. Anyone with this link can
          download the file once.
        </Typography>

        <FormControl fullWidth sx={{ my: 2 }}>
          <InputLabel id="expiration-label">Link Expires In</InputLabel>
          <Select
            labelId="expiration-label"
            value={expiration}
            label="Link Expires In"
            onChange={(e) => onExpirationChange(e.target.value)}
          >
            <MenuItem value={300}>5 Minutes</MenuItem>
            <MenuItem value={600}>10 Minutes</MenuItem>
            <MenuItem value={900}>15 Minutes</MenuItem>
            <MenuItem value={1800}>30 Minutes</MenuItem>
            <MenuItem value={3600}>1 Hour</MenuItem>
            <MenuItem value={21600}>6 Hours</MenuItem>
            <MenuItem value={43200}>12 Hours</MenuItem>
            <MenuItem value={86400}>24 Hours (Default)</MenuItem>
            <MenuItem value={604800}>7 Days</MenuItem>
          </Select>
        </FormControl>

        {link ? (
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <InputBase
              value={link}
              readOnly
              sx={{
                flex: 1,
                border: "1px solid #ccc",
                p: 1,
                borderRadius: "4px",
              }}
            />
            <IconButton onClick={copyLink}>
              <ContentCopy />
            </IconButton>
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            onClick={onGenerate}
            disabled={generating}
            sx={{ mt: 2 }}
          >
            {generating ? (
              <CircularProgress size={24} />
            ) : (
              "Generate Secure Link"
            )}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Dashboard() {
  const { logout } = useAuth();
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("active"); // 'active', 'trashed', 'archived'
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [shareFile, setShareFile] = useState(null); // <-- Keep track of which file is being shared
  const [linkExpiration, setLinkExpiration] = useState(86400); // <-- State for the expiration time
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [userEmail, setUserEmail] = useState("Loading...");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get("http://localhost:5002/files/my-files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllFiles(response.data);
    } catch (error) {
      toast.error("Could not fetch your files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const token = localStorage.getItem("access_token");
        // Call the protected endpoint to get user details
        const response = await axios.get(
          "http://localhost:5001/auth/protected",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserEmail(response.data.logged_in_as);
      } catch (error) {
        navigate("/login");
        console.error("Failed to fetch user email:", error);
        setUserEmail("User"); // Fallback email
      }
    };

    fetchUserEmail();
    fetchData();
  }, []);

  const handleStatusChange = async (fileId, newStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `http://localhost:5002/files/file/${fileId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`File successfully moved to ${newStatus}.`);
      fetchData();
    } catch (error) {
      toast.error("Failed to update file status.");
    }
  };

  const handlePermanentDelete = async (fileId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://localhost:5002/files/file/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("File permanently deleted.");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete file.");
    }
  };

  const handleUploadComplete = () => {
    fetchData(); // Refresh file list
    setIsUploadOpen(false);
  };

  const handleLogout = () => {
    clearAllKeys(); // Clear stored keys on logout
    logout();
  };

  const openShareDialog = (file) => {
    setShareFile(file); // Set the file to be shared
    setGeneratedLink(""); // Reset previous link
    setLinkExpiration(86400); // Reset to default
    setShareDialogOpen(true);
  };

  const handleGenerateLink = async () => {
    if (!shareFile) {
      toast.error("No file selected for sharing.");
      return;
    }

    setIsGeneratingLink(true);

    try {
      // 1. Fetch the required key from IndexedDB
      const fileKey = await getFileKey(shareFile.id);

      if (!fileKey) {
        toast.error(
          "File key not found in this browser. Please re-upload to create a new key."
        );
        setIsGeneratingLink(false); // Stop loading on error
        return;
      }

      // 2. Generate the client-side secret
      const linkSecret = generateLinkSecret();

      // 3. Encrypt (wrap) the file's AES key with the secret
      const wrappedKey = await wrapFileKey(fileKey, linkSecret);

      // ... (rest of the link generation logic is the same)
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://localhost:5003/access/link/create",
        {
          file_id: shareFile.id,
          wrapped_key: wrappedKey,
          expires_in: linkExpiration,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { share_id } = response.data;
      const fullLink = `${window.location.origin}/download/${share_id}#${linkSecret}`;
      setGeneratedLink(fullLink);
      setShareDialogOpen(true);
    } catch (error) {
      toast.error("Could not create share link.");
      console.error(error);
    }
  };
  const filesToDisplay = allFiles.filter((file) => file.status === currentView);
  const viewTitles = {
    active: "My Drive",
    trashed: "Trash",
    archived: "Archived",
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <ToastContainer position="bottom-right" />

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            E2EE Share
          </Typography>
        </Toolbar>
        <Box sx={{ p: 2 }}>
          <Button
            onClick={() => setIsUploadOpen(true)}
            variant="contained"
            startIcon={<Add />}
            fullWidth
            sx={{ boxShadow: "none", borderRadius: "16px" }}
          >
            New
          </Button>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setCurrentView("active")}
              selected={currentView === "active"}
            >
              <ListItemIcon>
                <Folder />
              </ListItemIcon>
              <ListItemText primary="My Drive" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setCurrentView("archived")}
              selected={currentView === "archived"}
            >
              <ListItemIcon>
                <Archive />
              </ListItemIcon>
              <ListItemText primary="Archived" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setCurrentView("trashed")}
              selected={currentView === "trashed"}
            >
              <ListItemIcon>
                <Delete />
              </ListItemIcon>
              <ListItemText primary="Trash" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}
      >
        <AppBar
          position="static"
          color="default"
          elevation={1}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: "semibold" }}>
              {userEmail}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ borderRadius: 2, textTransform: "none" }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Typography variant="h5" gutterBottom sx={{ px: 2, fontWeight: 500 }}>
          {viewTitles[currentView]}
        </Typography>

        {/* File List Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1.5,
            borderBottom: "1px solid #ccc",
            color: "text.secondary",
          }}
        >
          <Box sx={{ width: 40, mr: 2 }}></Box> {/* Spacer for icon */}
          <Typography variant="body2" sx={{ flex: 1, fontWeight: "bold" }}>
            Name
          </Typography>
          <Typography
            variant="body2"
            sx={{ flex: 0.5, textAlign: "center", fontWeight: "bold" }}
          >
            Size
          </Typography>
          <Typography
            variant="body2"
            sx={{ flex: 0.5, textAlign: "center", fontWeight: "bold" }}
          >
            Upload Date
          </Typography>
          <Box sx={{ flex: 0.2, textAlign: "right" }}></Box>{" "}
          {/* Spacer for menu */}
        </Box>

        {/* File List */}
        <Paper
          variant="outlined"
          sx={{ flexGrow: 1, overflowY: "auto", background: "white" }}
        >
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filesToDisplay.length > 0 ? (
            filesToDisplay.map((file) => (
              <FileRow
                key={file.id}
                file={file}
                onStatusChange={handleStatusChange}
                onPermanentDelete={handlePermanentDelete}
                onShare={openShareDialog}
              />
            ))
          ) : (
            <Typography
              sx={{ p: 4, textAlign: "center", color: "text.secondary" }}
            >
              This folder is empty.
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Upload Dialog */}
      <Dialog
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Upload New File</DialogTitle>
        <DialogContent>
          <UploadFile onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <ShareDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        link={generatedLink}
        expiration={linkExpiration}
        onExpirationChange={setLinkExpiration}
        onGenerate={handleGenerateLink}
        generating={isGeneratingLink}
      />


    </Box>
  );
}

export default Dashboard;
