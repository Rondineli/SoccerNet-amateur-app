import { useState, useEffect } from "react";
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";

import FetchModal from "./ModalConfig"

function LegendItem({ color, label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box
        sx={{
          width: 16,
          height: 16,
          backgroundColor: color,
          borderRadius: 0.5,
          border: "1px solid rgba(0,0,0,0.2)",
        }}
      />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}


function TableLegend() {
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        mb: 3,
        display: "flex",
        gap: 4,
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Legend:
      </Typography>

      <LegendItem color="#4caf50" label="Lower mAP" />
      <LegendItem color="#f44336" label="Higher mAP" />
    </Paper>
  );
}


function mergeByLabel(tight = [], loose = []) {
  const map = {};

  tight.forEach((item) => {
    map[item.label] = { label: item.label, tight: item };
  });

  loose.forEach((item) => {
    map[item.label] = {
      ...map[item.label],
      label: item.label,
      loose: item,
    };
  });

  return Object.values(map);
}

function reorganizeByLabel(data) {
  const result = {};

  for (const [modelName, modelData] of Object.entries(data)) {
    const { loose = [], tight = [] } = modelData;

    // Index tight by label for fast lookup
    const tightByLabel = {};
    for (const t of tight) {
      tightByLabel[t.label] = t;
    }

    // Iterate loose (labels live here too)
    for (const l of loose) {
      const label = l.label;

      if (!result[label]) {
        result[label] = [];
      }

      result[label].push({
        modelName,
        loose: {
          Any: l.Any,
          Visible: l.Visible,
          Unseen: l.Unseen,
        },
        tight: {
          Any: tightByLabel[label]?.Any ?? null,
          Visible: tightByLabel[label]?.Visible ?? null,
          Unseen: tightByLabel[label]?.Unseen ?? null,
        },
      });
    }
  }

  return result;
}


const returnModelHumanTranslation = (model) => {
  const models = {
    json_soccernet_calf_resnetpca512: "SoccerNet Professional",
    json_soccernet_calf_resnetpca512_amateur_model_no_tf: "SoccerNet trained on amateur data",
    json_soccernet_calf_resnetpca512_amateur_model_st_2: "SoccerNet with transfer Learning"
  }

  return models[model];

}


export default function MetricsTable({data, title, dataset}) {

  const [highermAPLabel, setHighermAPLabel] = useState(0);
  const [lowermAPLabel, setLowermAPLabel] = useState(0);

  const _mapColunms = Object.keys(data).sort();
  const _mapObjects = reorganizeByLabel(data);


  useEffect(() => {
    let highest = null;
    let lowest = null;
  
    Object.entries(_mapObjects).forEach(([label, models]) => {
      // Find the lowest and highest mAP to print in the table
      models.forEach((model) => {
        // const value = model.loose?.Any || model.loose?.Unseen || model.loose?.Visible;
        let value;

        if (model.loose?.Any) {
          value = model.loose?.Any
        }

        if (model.loose?.Any) {
          value = model.loose?.Unseen
        }

        if (model.loose?.Any) {
          value = model.loose?.Visible
        }
  
        if (value == null) return;
  
        if (!highest || value > highest.value) {
          highest = { label, value };
        }
  
        if (!lowest || value < lowest.value) {
          lowest = { label, value };
        }
      });
    });
  
    setHighermAPLabel(highest);
    setLowermAPLabel(lowest);
  }, [_mapObjects]);
  

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      <FetchModal dataset={dataset}/>
      <TableContainer component={Paper} sx={{ backgroundColor: "#fff" }}>
        <Table sx={{borderCollapse: 'separate'}}>
        {/* HEADER (ROW) 1 */}
        <TableHead>
          <TableRow>
            <TableCell rowSpan={3}>
              <strong>Label</strong>
            </TableCell>

            {_mapColunms.map((model, subIdx) => (
              <TableCell
                key={returnModelHumanTranslation(model)}
                align="center"
                colSpan={6}
                sx={{
                  borderLeft:
                    subIdx % 1 === 0 || subIdx === 0
                      ? (theme) => `1px solid ${theme.palette.divider}`
                      : undefined,
                }}
              >
                <strong>{returnModelHumanTranslation(model)}</strong>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {_mapColunms.map((model) => (
              <>
              {["loose", "tight"].map((metric, subIdx) => (
                <TableCell
                  key={`${model}-${metric}`}
                  align="center"
                  colSpan={3}
                  sx={{
                    borderLeft:
                      subIdx === 0
                        ? (theme) => `1px solid ${theme.palette.divider}`
                        : undefined,
                  }}
                >
                  <strong>{metric}</strong>
                </TableCell>
              ))}
              </>
            ))}
          </TableRow>

          {/* HEADER (ROW) 2 */}
          <TableRow>
            {_mapColunms.map((model) => (
              <>
                
                {["Any", "Unseen", "Visible"].map((sub, subIdx) => (
                  <TableCell
                    colSpan={1}
                    key={`${model}-${sub}`}
                    align="center"
                    sx={{
                      borderLeft:
                        subIdx === 0
                          ? (theme) => `1px solid ${theme.palette.divider}`
                          : undefined,
                    }}
                  >
                    {sub}
                  </TableCell>
                ))}
                {["Any", "Unseen", "Visible"].map((sub, subIdx) => (
                  <TableCell
                    colSpan={1}
                    key={`${model}-${sub}`}
                    align="center"
                    sx={{
                      borderLeft:
                        subIdx === 0
                          ? (theme) => `1px solid ${theme.palette.divider}`
                          : undefined,
                    }}
                  >
                    {sub}
                  </TableCell>
                ))}
              </>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
            {/* iterate over labels */}
            {Object.entries(_mapObjects).map(([label, dt1], idx) => (
              <>
                <TableRow key={`${label}`}>
                  <TableCell align="center">
                    {label}
                  </TableCell>

                  <TableCell 
                    sx={{
                      borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[0]?.loose?.Any
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[0]?.loose?.Any
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[0]?.loose?.Any}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[0]?.loose?.Unseen
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[0]?.loose?.Unseen
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[0]?.loose?.Unseen}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[0]?.loose?.Visible
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[0]?.loose?.Visible
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[0]?.loose?.Visible}</TableCell>

                  <TableCell
                    sx={{
                      borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[0]?.tight?.Any
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[0]?.tight?.Any
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[0]?.tight?.Any}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[0]?.tight?.Unseen
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[0]?.tight?.Unseen
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[0]?.tight?.Unseen}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[0]?.tight?.Visible
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[0]?.tight?.Visible
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[0]?.tight?.Visible}</TableCell>

                  <TableCell
                    sx={{
                      borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[1]?.loose?.Any
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[1]?.loose?.Any
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[1]?.loose?.Any}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[1]?.loose?.Unseen
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[1]?.loose?.Unseen
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[1]?.loose?.Unseen}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[1]?.loose?.Visible
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[1]?.loose?.Visible
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[1]?.loose?.Visible}</TableCell>

                  <TableCell
                    sx={{
                      borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[1]?.tight?.Any
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[1]?.tight?.Any
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[1]?.tight?.Any}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[1]?.tight?.Unseen
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[1]?.tight?.Unseen
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[1]?.tight?.Unseen}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[1]?.tight?.Visible
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[1]?.tight?.Visible
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[1]?.tight?.Visible}</TableCell>

                  <TableCell
                    sx={{
                      borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[2]?.loose?.Any
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[2]?.loose?.Any
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[2]?.loose?.Any}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[2]?.loose?.Unseen
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[2]?.loose?.Unseen
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[2]?.loose?.Unseen}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[2]?.loose?.Visible
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[2]?.loose?.Visible
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[2]?.loose?.Visible}</TableCell>

                  <TableCell
                    sx={{
                      borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[2]?.tight?.Any
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[2]?.tight?.Any
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[2]?.tight?.Any}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[2]?.tight?.Unseen
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[2]?.tight?.Unseen
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[2]?.tight?.Unseen}</TableCell>
                  <TableCell
                    sx={{
                      backgroundColor:
                        highermAPLabel?.label === label &&
                        highermAPLabel?.value === dt1[2]?.tight?.Visible
                          ? "#f44336"
                          : lowermAPLabel?.label === label &&
                            lowermAPLabel?.value === dt1[2]?.tight?.Visible
                          ? "#4caf50"
                          : "transparent",
                    }}
                    align="center"
                  >{dt1[2]?.tight?.Visible}</TableCell>
                </TableRow>
              </>
              
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TableLegend/>
    </Box>
  );
}
