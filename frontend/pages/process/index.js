import { useState, useEffect } from "react";
import IdSearch from "@/components/YoutubeProcess/IdSearch";
import StatusPanel from "@/components/YoutubeProcess/StatusPanel";

import React from "react";
import Context from "@/context/Context";

import PageHead from "../Head";

import Header from "@/components/Header/Header";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import Footer from "@/components/Footers/Footer";
import Copyright from "@/components/Footers/Copyright";


export default function HomePage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");
  const [onCenter, setOnCenter] = useState(true);
  const [modelType, setModelType] = useState("json_soccernet_calf_resnetpca512_amateur_model_st_2");
  const [styleHeight, setStyleHeigth] = useState({height: '100vh'});
  const [styleHeightIdSearch, setStyleHeightIdSearch] = useState({height: '100vh'});

  const [retry, setRetry] = useState(true);

  const fetchStatus = async ({id, modelType}) => {
    console.log(`Fetch starting....`)

    if (statusData?.status === "finished") {
      return statusData;
    }

    console.log(`Done with Fetch starting....`)

    setLoading(true);
    if (!statusData) {
      setStatusData(null);
    }
    setId(id);
    setOnCenter(false);
    //setStyleHeigth({height: '0'})

    try {
      const res = await fetch(`/api/videos/process`, {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({youtubeID: id, modelType})
      });
    
      if (!res.ok) {
        throw new Error("Request failed");
      }

      const data = await res.json();

      if (data.status === "finished") {
        setRetry(false);
        setStyleHeigth({height: '0'})
        setStyleHeightIdSearch({height: '0'})
      } else {
        setRetry(true);
        setStyleHeigth({height: '100vh'})
        setStyleHeightIdSearch({height: '0'})
      }

      setStatusData(data);
      return data;

    } catch (err) {
      setStatusData({ status: "error", message: "Failed to fetch status" });
    } finally {
      setLoading(false);
    }
  };

  const menuText = [
    "Process ID",
    "Curate",
    "BenchMark"
  ]

  return (
    <>
      <PageHead title="Home" />
      <main className="page-wrapper">
        <Context>
          <Header
            headerTransparent="header-transparent"
            headerSticky="header-sticky"
            btnClass="rainbow-gradient-btn"
            menuText={menuText}
          />
          <PopupMobileMenu />
          <div
            className="slider-area slider-style-1 variation-default slider-bg-image bg-banner1 slider-bg-shape"
            data-black-overlay="1"
          >
            <div
              className="container"
            >
              <div
                className="row justify-content-center"
                style={styleHeightIdSearch}
              >
                <IdSearch
                  retry={retry}
                  onSubmit={fetchStatus}
                  onCenter={onCenter}
                  modelType={modelType}
                  setModelType={setModelType}
                />
              </div>
              <section id="results" style={{ width: "100%", marginTop: "30px" }} sx={{ pt: "100px"}}>
                <div
                  className="container row col-lg-12 justify-content-center align-items-center"
                  style={{styleHeight}}
                >
                  <StatusPanel
                    loading={loading}
                    data={statusData}
                    modelType={modelType}
                  />
                </div>
              </section>
            </div>
          </div>
          <Footer />
          <Copyright />
        </Context>
      </main>
    </>



  );
}
