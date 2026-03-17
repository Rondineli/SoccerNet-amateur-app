"use client";

import Sal from "sal.js";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import shapeOne from "../../public/images/bg/icon-shape/icon-shape-one.png";
import shapeTwo from "../../public/images/bg/icon-shape/icon-shape-two.png";
import shapeThree from "../../public/images/bg/icon-shape/icon-shape-three.png";
import shapeFour from "../../public/images/bg/icon-shape/icon-shape-four.png";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Slider,
  Box,
} from "@mui/material";

import { useAppContext } from "@/context/Context";

const INTERVAL_UPDATE=9000;

const _messages = [
  {
    text: "Download video id and saving it from YoutbeAPI",
    image: '/images/icons/cho_dark.png',
    image_light: '/images/icons/cho_light.png',
    alt: 'Cho1',
  },
  {
    text: "Extracting features and reducing to 512 dimensions using Principal Component Analysis (PCA)",
    image: '/images/icons/cho_1_dark.png',
    image_light: '/images/icons/cho_1_light.png',
    alt: 'Cho2',
  },
  {
    text: "Running selected model inference",
    image: '/images/icons/cho_2_dark.png',
    image_light: '/images/icons/cho_2_light.png',
    alt: 'Cho2',
  },
  {
    text: "Generating 10s clips of model inference results",
    image: '/images/icons/cho_3_dark.png',
    image_light: '/images/icons/cho_3_light.png',
    alt: 'Cho3',
  }
];

const modelConfigTranslations = {
  "json_soccernet_calf_resnetpca512": "configs/contextawarelossfunction/json_soccernet_calf_resnetpca512.py",
  "json_soccernet_calf_resnetpca512_amateur_model_no_tf": "configs/contextawarelossfunction/json_soccernet_calf_resnetpca512_amateur_model_no_tf.py",
  "json_soccernet_calf_resnetpca512_amateur_model_st_2": "configs/contextawarelossfunction/json_soccernet_calf_resnetpca512_amateur_model_st_2.py"
}


function VideosPage({videoUrls}) {
  console.log(`[RDEBUG] RECEIVED => ${JSON.stringify(videoUrls)}`);
  const [cutConfidence, setCutConfidence] = useState(0);
  const [rows, setRows] = useState([]);

  const getFileName = (url) => url.split("/").pop();

  const getLabelSecondsName = (videoName) => {
    const nameWithoutExt = getFileName(videoName);
    const parts = nameWithoutExt.split("_");

    const label = parts[1].split("l:")[1];
    const time = parts[2].split("s:")[1];

    const conf = parts[3].split(":")[1];

    
    return `${label} ${time} ${parseFloat(conf).toFixed(3)}`;
  }

  const maxConfidence = React.useMemo(() => {
    if (!videoUrls?.length) return 0;
  
    const values = videoUrls.map((videoUrl) => {
      const fileName = getFileName(videoUrl);
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      const parts = nameWithoutExt.split("_");
  
      const confPart = parts.find(p => p.startsWith("c:"));
      return confPart ? parseFloat(confPart.split(":")[1]) : 0;
    });
  
    return Math.max(...values);
  }, [videoUrls]);

  const getConfidenceCut = (videoUrl) => {
    const fileName = getFileName(videoUrl);
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
    const parts = nameWithoutExt.split("_");
  
    const confPart = parts.find(p => p.startsWith("c:"));
    if (!confPart) return false;
  
    const parsedConf = parseFloat(confPart.split(":")[1]);
    return parsedConf >= parseFloat(cutConfidence);
  };
  

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  useEffect(() => {
    if (!videoUrls?.length) return;
  
    const filteredVideos = videoUrls.filter(getConfidenceCut);
    setRows(chunkArray(filteredVideos, 3));
  }, [videoUrls, cutConfidence]);
  
  
  useEffect(() => {
    console.log("[RDEBUG] ROWS UPDATED =>", rows);
  }, [rows]);

  return (
    <div className="col-lg-12 justify-content-center align-items-center" >
      <Grid className="justify-content-center align-items-center" container columns={1} spacing={6}>
        {videoUrls.length === 0 ? (
          <h4> No clips or results from inference, try another id....</h4>
        ) : (
          <>
            <Typography variant="h6" style={{ color: "#fff", marginTop: "100px" }}>
  Confidence Filter: {cutConfidence.toFixed(3)}
            </Typography>

            <Slider
              sx={{ mt: 1 }}
              min={0}
              max={maxConfidence}
              step={0.001}
              value={cutConfidence}
              onChange={(_, value) =>
                setCutConfidence(Array.isArray(value) ? value[0] : value)
              }
            />
          </>
        )}
          {rows.map((row, rowIndex) => (
            <>
            {row.map((videoUrl) => (
              <Grid item xs={4} md={4} key={videoUrl}>
                <Card
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    overflow: "visible",
                    height: "100%"
                  }}
                >
                  <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
                    <video
                      controls
                      preload="metadata"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 10
                      }}
                    >
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                  </Box>

                  <CardContent>
                    <Typography variant="h6" style={{ color: "#000" }}>
                      {getLabelSecondsName(videoUrl)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            </>
          ))}
      </Grid>
    </div>
  );
}


export default function StatusPanel({ loading, data, modelType}) {

  const [messages, setMessages] = useState(_messages);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState("🔄");
  const [currentIndex, setCurrentIndex] = useState(visibleIndex);
  const [width, setWidth] = useState(126);
  const [heitgh, setHeigth] = useState(258);
  const { isLightTheme } = useAppContext();
  const [fade, setFadeState] = useState('fade-in');
  const [fadeState, setFade] = useState(false);

  const envModelSet = modelConfigTranslations[modelType];

  const statusIcon = {
    started: "🔄",
    finished: "✅",
    completed: "✅",
    downloading: "🔄",
    error: "❌",
    "": "🔄",
  };

  const dataArray = {
    phase_1_status: {message: "Processing Video buffer Download", sub: ""},
    phase_2_status: {message: "Generating PCA 512-Dimensions", sub: ""},
    phase_3_status: {message: "Processing Model Inference", sub: ""},
    phase_4_status: {message: "Generating clips", sub: ""}
  }

  const phases = [
    { key: "phase_1_status", index: 0 },
    { key: "phase_2_status", index: 1 },
    { key: "phase_3_status", index: 2 },
    { key: "phase_4_status", index: 3 },
  ];

  const getVisiblePhases = (data) => {
    const lastIndex = phases.findLastIndex(
      (p) => data?.[p.key]
    );
  
    if (lastIndex === -1) return [phases[0]];
  
    const g = phases.slice(0, lastIndex + 1);
    return g;
  };

  const getIcons = (status) => {
    if (!status) { return }

    return statusIcon[status]
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade-out
      setTimeout(() => {
        setFade(true); // fade-in
      }, INTERVAL_UPDATE);
    }, INTERVAL_UPDATE);
    return () => clearInterval(interval);
  }, [visibleIndex]);
  
  useEffect(() => {
    console.log(`[DEBUG]:: => ${visibleIndex} as visibleIndex set.`)
    const interval = setInterval(() => {
      setVisibleIndex(prev => (prev + 1) % getVisiblePhases(data).length);
    }, INTERVAL_UPDATE);

    return () => clearInterval(interval);
  }, [data]);

  if (loading) {
    return <p>⏳ Checking status…</p>;
  }

  if (!data) {
    return <></>;
  }

  

  if ((data[envModelSet]?.s3_objects_list && data[envModelSet].s3_objects_list.length > 0) || data.status === "finished") {
    return (
      <div className="col-lg-12 justify-content-center align-items-center">
        <VideosPage videoUrls={data[envModelSet]?.s3_objects_list} />
      </div>
    )
  }

  return (
    <>
      <div className="inner text-center" style={{ top: "30px" }}>
        <h1 className="title display-one flex flex-col12 items-center justify-center text-center" style={{ width: "100vh !important", maxWidth: "100vh !important" }}>
          <span className="text-6xl sm:text-6xl lg:text-6xl font-bold">...We Are{" "}</span>
          <br/>
        </h1>
        <span className="header-caption mt-4">
          <span className="cd-headline rotate-1">
            <span
              className="cd-words-wrapper block text-12xl sm:text-12xl lg:text-12xl !w-auto"
              style={{ width: "auto" }}
            >
              {getVisiblePhases(data).map(({ key, index }) => (
                <b
                  key={key}
                  className={visibleIndex === index ? "is-visible" : "is-hidden"}
                  style={{ fontSize: "30px" }}
                >
                  <span
                    className="text-1xl sm:text-1xl lg:text-1xl font-bold"
                    style={{ fontSize: "3rem" }}
                  >
                    {getIcons(data[key])}{" "}
                  </span>

                  <span
                    className="theme-gradient"
                    style={{ fontSize: "3rem" }}
                  >
                    {dataArray[key].message}
                  </span>
                </b>
              ))}
            </span>
          </span>
        </span>

        <span className="inner mt-4">
          <span className="cd-headline rotate-1">
            <span className="cd-words-wrapper block text-6xl sm:text-6xl lg:text-5xl force-center">
              {messages.map((item, idx) => (
                <b key={idx} className={`${visibleIndex === idx ? 'is-visible' : 'is-hidden'}`}>
                  <p style={{
                    margin: 0,
                    textAlign: 'center',
                    wordBreak: 'break-word',
                    whiteSpace: 'normal',
                    maxWidth: '90vw',
                  }} className={"force-center"}>
                    {item.text} {
                    idx === 0 ? `${data?.progress || 0}%`: ''}
                  </p>
                  <Image
                    src={isLightTheme ? item.image : item.image_light}
                    width={width}
                    height={heitgh}
                    alt={item.alt}
                    style={{ marginTop: "8px" }}
                  />
                </b>
              ))}
            </span>
          </span>
        </span>
        <div className="inner-shape">
          <Image
            src={shapeTwo}
            width={60}
            height={57}
            alt="Icon Shape"
            className="iconshape iconshape-two"
          />
          <Image
            src={shapeThree}
            width={42}
            height={31}
            alt="Icon Shape"
            className="iconshape iconshape-three"
          />
          <Image
            src={shapeFour}
            width={100}
            height={95}
            alt="Icon Shape"
            className="iconshape iconshape-four"
          />
          <Image
            src={shapeOne}
            width={100}
            height={95}
            alt="Icon Shape"
            className="iconshape iconshape-one"
          />
        </div>
      </div>
    </>
  );
}