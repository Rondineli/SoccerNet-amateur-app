// components/CurateComp/CurateComp.js
import { v4 as uuidv4 } from "uuid";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Paper,
  Slider,
  Stack,
  Alert,
  Snackbar,
  Select,
  MenuItem
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

import { addSegment as saveSegment, getVideoSegments, deleteItem, editItem } from "./utilsStorage";
import { BasicAutocomplete } from "./AutoComplete";
import DownloadButton from "./DownloadButton";


const playerShellStyle = {
    position: "relative",
    width: "100%",
    height: 420,
    background: "#000",
    overflow: "hidden",
    borderRadius: 12,
};

const innerBoxStyle = {
    width: "100%",
    height: "100%",
};


// load react-player only on client
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const isHostedVideo = (url) => !!url && /\.(mp4|webm|ogg)(\?.*)?$/.test(url);
const isExternalPlayer = (url) =>
  !!url && /youtube|youtu\.be|vimeo|dailymotion/.test(url);

export default function CurateComp() {
  const [videoUrl, setVideoUrl] = useState("");
  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [backSeconds, setBackSeconds] = useState(2);

  const [half, setHalf] = useState(1); // 1 or 2
  const [team, setTeam] = useState("home");
  const [visibility, setVisibility] = useState("visible");
  const [label, setLabel] = useState("");
  const [annotations, setAnnotations] = useState([]);
  const [segments, setSegments] = useState([]);
  const [lastEvent, setLastEvent] = useState({});

  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [gameData, setGameData] = useState({
    UrlLocal: "",
    UrlYoutube: "",
    gameDate: new Date(),
    gameAwayTeam: "",
    gameHomeTeam: "",
    gameScore: "0 x 0",
    KickStartTime: "",
  });

  const [loadedUrlSegments, setLoadedUrlSegments] = useState({});

  const [openAlert, setOpenAlert] = useState(false);
  const [openErrorAlert, setOpenErrorAlert] = useState(false);
  const [files, setFiles] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");

  const rotatedInnerStyle = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transform: `rotate(${rotation}deg)`,
    transformOrigin: "center center",
    width: "100%",
  height: "100%",
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSegments(getVideoSegments(videoUrl, `segments_${videoUrl}`, []));
      setAnnotations(getVideoSegments(videoUrl, `segments_${videoUrl}`, []));
      setGameData(getVideoSegments(videoUrl, `segments_metadata_${videoUrl}`, {})?.metadata );

      // loadedUrlSegments, setLoadedUrlSegments
      setLoadedUrlSegments((prev) => ({
        ...prev,
        [videoUrl]: true
      }));
    }
  }, [videoUrl]);

  useEffect(() => {
    fetch("/api/videos/list")
      .then((res) => res.json())
      .then((data) => setFiles(data.files));
  }, []);

  useEffect(() => {
    setGameData((prev) => ({
      ...prev,
      UrlLocal: videoUrl,
      UrlYoutube: extractVideoId(videoUrl)
        ? `https://www.youtube.com/watch?v=${extractVideoId(videoUrl)}`
        : "",
    }));
  }, [videoUrl]);

  useEffect(() => {
    console.log(`Saving segment....${JSON.stringify(gameData)}`)
    if (loadedUrlSegments[videoUrl]) {
      saveSegment(videoUrl, {"metadata": gameData})
    }
  }, [gameData])

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Saving gamedata to: n=> ${name}:: v=> ${value}`)
    setGameData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return; // ignore clickaway closes
    setOpenAlert(false);
  };

  const handleSeekBack = () => {
    seekTo(Math.max(currentTime - backSeconds, 0));
  };

  const handleSeekForward = () => {
    seekTo(Math.max(currentTime + backSeconds, 0));
  };

  const secondsToMMSS = (seconds) => {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  };

  function soccernetPositionToSecondsInt(positionMs) {
    return Math.floor(positionMs / 1000);
  }

  const saveEdit = () => {
    try {
      const parsed = JSON.parse(editValue);
      handleEditAnnotation(parsed, editIndex);
      setEditOpen(false);
    } catch (err) {
      alert(`Invalid JSON: ${err}`);
    }
  };

  const openEditModal = (annotation, index) => {
    setEditIndex(index);
    setEditValue(JSON.stringify(annotation, null, 2));
    setEditOpen(true);
    console.log(`Edit is open True now, shoould the modal?`)
  };

  const secondsToPosition = (seconds) =>
    String(Math.round(seconds * 1000));

  // refs
  const playerRef = useRef(null);
  const videoRef  = useRef(null);
  const recentTimeRef = useRef(0);
  const frameTimeRef = useRef(0);

  // ReactPlayer events
  const onPlayerProgress = useCallback((state) => {
    if (!draggingRef.current && typeof state.playedSeconds === "number") {
      setCurrentTime(state.playedSeconds);
    }
  }, []);

  const onPlayerDuration = useCallback((sec) => {
    if (typeof sec === "number") setDuration(sec);
  }, []);

  // Native <video> events
  const onNativeTimeUpdate = () => {
    if (!draggingRef.current) {
      setCurrentTime(videoRef.current?.currentTime ?? 0);
    }
  };

  const onNativeLoadedMetadata = () => {
    const d = videoRef.current?.duration ?? 0;
    setDuration(d);
  };

  // Frame-accurate callback
  const handleNativeFrame = (_now, metadata) => {
    frameTimeRef.current = metadata.mediaTime;
    videoRef.current.requestVideoFrameCallback(handleNativeFrame);
  };


  // Setup frame callback for hosted videos
  useEffect(() => {
    if (typeof window !== "undefined") {
        setSegments(getVideoSegments(videoUrl, `segments_${videoUrl}`, []));
      }
    if (isHostedVideo(videoUrl) && videoRef.current) {
      videoRef.current.requestVideoFrameCallback(handleNativeFrame);

    if (videoRef.current && isHostedVideo(videoUrl)) {
        const update = (now, metadata) => {
          setCurrentTime(metadata.mediaTime);
          videoRef.current.requestVideoFrameCallback(update);
        };
        videoRef.current.requestVideoFrameCallback(update);
      }}
  }, [videoUrl]);

  useEffect(() => {
    for (var x = 0; x <= files.length; x++) {
      if (files[x] && files[x].endsWith(".mp4")) {
        setVideoUrl(files[x]);
      }
    }
    
  }, [files])


  // Reset state and load saved segments when URL changes
  useEffect(() => {
    recentTimeRef.current = 0;
    frameTimeRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
    setPlaying(false);

    const existing = getVideoSegments(videoUrl, `segments_${videoUrl}`, []) || [];
    setSegments(existing);
    console.log(`Set ${JSON.stringify(existing)}`)

    setLastEvent(existing[existing.length-1])
  }, [videoUrl]);

  // Play hook whe a new url is set
  const togglePlay = () => {
    if (isExternalPlayer(videoUrl)) {
      setPlaying((p) => !p); // ReactPlayer listens to this prop
    } else if (isHostedVideo(videoUrl)) {
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setPlaying((p) => !p);
    }
  };
  
  const rotateVideo = () => setRotation((r) => (r + 90) % 360);

  const seekTo = (seconds) => {
    if (!Number.isFinite(seconds) || !videoRef.current) return;
    console.log(`SeekTo invoked: => ${seconds}`)
  
    if (isExternalPlayer(videoUrl)) {
      playerRef.current?.seekTo(seconds, "seconds");
    } else if (isHostedVideo(videoUrl)) {
      videoRef.current.currentTime = seconds;
    }
  
    setCurrentTime(seconds);
    recentTimeRef.current = seconds;
  };

  const draggingRef = useRef(false);

  const downloadJson = () => {
    console.log(`Downloading segments: => ${JSON.stringify(segments)}`);
    console.log(`Merging => ${JSON.stringify(gameData)}`)

    const finalLabel = {
      ...gameData,
      annotations: annotations.map(({ id, ...rest }) => rest)
    }

    console.log(`Final Download file: ${JSON.stringify(finalLabel)}`)

    const blob = new Blob([JSON.stringify(finalLabel, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `segments_${videoUrl}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // player renderers
  const renderExternal = () => (
    <ReactPlayer
      ref={(r) => (playerRef.current = r)}
      url={videoUrl}
      playing={playing}
      controls={false}
      width="100%"
      height="100%"
      style={{ width: "100%", height: "100%" }}
      onProgress={onPlayerProgress}
      onDuration={onPlayerDuration}
    />

  );

  const extractVideoId = (videoUrl) => {
    try {
      const match = videoUrl.match(/\[([A-Za-z0-9_-]{11})\]/);
      return match ? match[1] : null;
    } catch(e) {
      return videoUrl;
    }
    
  };

  const renderNative = () => (
    <video
      ref={videoRef}
      src={videoUrl}
      controls={false}
      width="100%"
      height="100%"
      onTimeUpdate={onNativeTimeUpdate}
      onLoadedMetadata={onNativeLoadedMetadata}
    />
  );

  const labelsAutoComplete = annotations.reduce((acc, seg) => {
    if (!acc.includes(seg.label)) {
      acc.push(seg.label);
    }
    return acc;
  }, []);
  

  const getLastProcessedSecond = (annotations) => {
    if (!Array.isArray(annotations) || annotations.length === 0) return null;
    return annotations.reduce((maxEnd, seg) => 
      typeof seg.end === "number" && seg.end > maxEnd ? seg.end : maxEnd
    , 0);
  }

  const autoCompleteChange = (v) => {
    console.log(`Segment set trough autocomplete: ${v}`)
    setLabel(v)
  }

  const addAnnotation = () => {
    if (!label) return setOpenErrorAlert(true);
  
    const positionMs = secondsToPosition(currentTime);
    const gameTime = `${half} - ${secondsToMMSS(currentTime)}`;
  
    const newEvent = {
      id: uuidv4(),
      gameTime,
      label,
      position: positionMs,
      team,
      visibility: visibility,
    };
  
    saveSegment(videoUrl, newEvent);
    setAnnotations(getVideoSegments(videoUrl, `segments_${videoUrl}`, []));
    setLabel("");
    setOpenErrorAlert(false);
    setOpenAlert(true);
  };

  useEffect(() => {

  }, [annotations])

  const handleDeleteAnnotation = (idObj, index) => {
    setAnnotations((prev) => {
      // If a valid id object is provided: { id: "..." }
      if (idObj && typeof idObj === "object" && idObj.id) {
        console.log(`Deleting by id: ${idObj.id}`);
        return prev.filter((a) => a.id !== idObj.id);
      }
  
      // Fallback: delete by index
      console.log(`Deleting by index: ${index}`);
      return prev.filter((_, i) => i !== index);
    });

    if (idObj && typeof idObj === "object" && idObj.id) {
      deleteItem(videoUrl, idObj?.id, index=null)
    } else {
      deleteItem(videoUrl, null, index)
    }
  };

  const handleEditAnnotation = (updatedObj, index) => {
    setAnnotations((prev) => {
      // Edit by id (preferred)
      if (updatedObj?.id) {
        console.log(`Editing by id: ${updatedObj.id}`);
        return prev.map((a) =>
          a.id === updatedObj.id ? { ...a, ...updatedObj } : a
        );
      }
  
      // Fallback: edit by index
      console.log(`Editing by index: ${index}`);
      return prev.map((a, i) =>
        i === index ? { ...a, ...updatedObj } : a
      );
    });
  
    // Persist to localStorage
    if (updatedObj?.id) {
      editItem(videoUrl, updatedObj, null);
    } else {
      editItem(videoUrl, updatedObj, index);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }} style={{ background: "#fff"}}>
      <Typography variant="h4" gutterBottom>Video Tagging Tool</Typography>
      <Snackbar
        open={openAlert}
        autoHideDuration={3000} // auto close after 3s
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={openErrorAlert ? "error" :"success"} sx={{ width: "100%" }}>
          {openErrorAlert ? "Error to save event!" : "✅ Action completed successfully!"}
        </Alert>
      </Snackbar>
      <div sx={{ mb: 2 }} style={{ gap: 20 }}>
        <BasicAutocomplete
          options={files}
          fullWidth
          value={videoUrl}
          label="Video URl"
          placeholder="YouTube or direct .mp4/.webm/.ogg URL"
          onChange={(v) => {
            console.log(`[DEBUG] Changed url => ${v}`);
            if (typeof v === "string") setVideoUrl(v);
            else if (v?.value) setVideoUrl(v.value);
          }}
        />
        <DownloadButton youtubeUrl={videoUrl} setUrl={setVideoUrl}/>
      </div>
      

      <Paper sx={{ p: 2, mb: 2 }}>
        {/* Player shell (controls outside) */}
        <div style={playerShellStyle}>
          <div style={rotatedInnerStyle}>
            <div style={innerBoxStyle}>
              {isExternalPlayer(videoUrl)
                ? renderExternal()
                : isHostedVideo(videoUrl)
                ? renderNative()
                : renderExternal()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <Button variant="contained" onClick={togglePlay}>
            {playing ? "Pause" : "Play"}
          </Button>
          <Button variant="outlined" color="secondary" onClick={rotateVideo}>
            Rotate 90°
          </Button>
          <Select value={half} onChange={(e) => setHalf(e.target.value)}>
            <MenuItem value={1}>1st Half</MenuItem>
            <MenuItem value={2}>2nd Half</MenuItem>
          </Select>
          <Select value={team} onChange={(e) => setTeam(e.target.value)}>
            <MenuItem value="home">Home</MenuItem>
            <MenuItem value="away">Away</MenuItem>
          </Select>
          <Select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <MenuItem value="visible">Visible</MenuItem>
            <MenuItem value="not-visible">Not-Visible</MenuItem>
          </Select>
          <Select
            size="small"
            value={backSeconds}
            onChange={(e) => setBackSeconds(Number(e.target.value))}
        >
            {[...Array(10)].map((_, i) => (
            <MenuItem key={i + 1} value={i + 1}>
                {i + 1}s
            </MenuItem>
            ))}
        </Select>

        <Button variant="outlined" onClick={handleSeekBack}>
            -{backSeconds}s
        </Button>
        <Button variant="outlined" onClick={handleSeekForward}>
          +{backSeconds}s
        </Button>
            <Stack>
                <Typography variant="title" sx={{ ml: 2 }}>
                    Seconds: {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </Typography>
                <Typography variant="title" sx={{ ml: 2 }}>
                    Time: {secondsToMMSS(currentTime)}
                </Typography>
                <Typography variant="title" sx={{ ml: 2 }}>
                    MMS (position): {secondsToPosition(currentTime)}
                </Typography>
                <Typography variant="title" sx={{ ml: 2 }}>* LP - {getLastProcessedSecond(segments)}s</Typography>

                <Typography variant="title" sx={{ ml: 2 }}>* {lastEvent?.label}:{lastEvent?.start}:{lastEvent?.end}s</Typography>
            </Stack>
        </Stack>

        <Slider
            sx={{ mt: 1 }}
            min={0}
            max={duration}
            step={0.01}
            value={Math.min(currentTime, duration)}
            onChange={(_, value) => seekTo(value)}
        />
        <>
          <EditIcon />
          <Button variant="outlined" onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}>Show avanced properties</Button>
        </>
        {
          showAdvancedOptions && (
            <TextField type="number" onChange={(e) => seekTo(soccernetPositionToSecondsInt(e.target.value))} label={"Go to positions (ms)"} placeholder="Start typing…" />
          )
        }
      </Paper>

      <div sx={{ mb: 2 }} style={{ gap: 20 }}>
        <BasicAutocomplete options={labelsAutoComplete} label="Label Name" onChange={autoCompleteChange} />
      </div>
      <div sx={{ mb: 2 }} style={{ gap: 20 }}>
      <Button variant="contained" color="primary" onClick={addAnnotation}>
        Add Event
      </Button>
      </div>

      <Typography variant="h6" gutterBottom>Tagged Segments</Typography>
      <List>
        {annotations.map((a, i) => (

          <ListItem
            key={i}
            divider
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  color="primary"
                  onClick={() => openEditModal(a, i)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  color="error"
                  onClick={() => handleDeleteAnnotation(a, i)}
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={`${a.label} (${a.team})`}
              secondary={`${a.gameTime} | position: ${a.position} ms | visibility: ${a.visibility}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h3" color="info">Metadata</Typography>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <>
            <div className="form-group">
              <label htmlFor="UrlLocal">UrlLocal</label>
              <input name="UrlLocal" id="UrlLocal" disabled={true} value={gameData.UrlLocal} />
            </div>
          </>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="form-group">
            <label htmlFor="UrlYoutube">UrlYoutube</label>
            <input name="UrlYoutube" id="UrlYoutube" disabled={true} value={gameData.UrlYoutube}/>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="form-group">
            <label htmlFor="gameDate">gameDate</label>
            <input name="gameDate" id="gameDate" type="text" onChange={handleChange} required={true} placeholder="Date of the match"value={gameData.gameDate}/>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="form-group">
            <label htmlFor="gameAwayTeam">gameAwayTeam</label>
            <input name="gameAwayTeam" id="gameAwayTeam" type="text" onChange={handleChange} required={true} placeholder="Away Team Name" value={gameData.gameAwayTeam}/>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="form-group">
            <label htmlFor="gameHomeTeam">gameHomeTeam</label>
            <input name="gameHomeTeam" id="gameHomeTeam" type="text" onChange={handleChange} required={true} placeholder="Home Team Name" value={gameData.gameHomeTeam}/>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="form-group">
            <label htmlFor="gameScore">gameScore</label>
            <input
              id="gameScore"
              name="gameScore"
              type="text"
              placeholder="Final Score"
              required={true}
              onChange={handleChange}
              value={gameData.gameScore}
            />
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-sm-6 col-12">
          <div className="form-group">
            <label htmlFor="firstname1">KickStartTime</label>
            <input id="firstname1" type="text" placeholder="00:00" required={true} onChange={handleChange} value={gameData.KickStartTime}/>
          </div>
        </div>
        <Modal open={editOpen} onClose={() => setEditOpen(false)}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Edit Annotation (JSON)
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={8}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>
            Save
          </Button>
        </Stack>
      </Box>
    </Modal>

      {annotations?.length > 0 && (
        <Button variant="contained" color="success" onClick={downloadJson}>
          Download JSON
        </Button>
      )}
    </Container>
  );
}

