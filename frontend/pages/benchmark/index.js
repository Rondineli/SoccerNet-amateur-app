import { useState, useEffect } from "react";
import MetricsTable from "@/components/Benchmark/MetricsTable";
import CenteredLoader from "@/components/Loader/CenteredLoader";

import React from "react";
import Context from "@/context/Context";

import PageHead from "../Head";

import Header from "@/components/Header/Header";
import PopupMobileMenu from "@/components/Header/PopUpMobileMenu";
import Footer from "@/components/Footers/Footer";
import Copyright from "@/components/Footers/Copyright";

const menuText = [
  "Process ID",
  "Curate",
  "BenchMark"
]

class DebugBoundary extends React.Component {
  state = { error: null, info: null };
  componentDidCatch(error, info) {
    console.error('Error caught by DebugBoundary:', error, info);
    this.setState({ error, info });
  }
  render() {
    if (this.state.error) {
      return <pre>{JSON.stringify(this.state.info, null, 2)}</pre>;
    }
    return this.props.children;
  }
}

const datasetTranslations = {
  "first": "/datasets/amateur/test_annotations.json",
  "second": "/datasets/amateur/test_amateur_annotations.json"
}

export default function BenchMArkPage() {
  const [statusData, setStatusData] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {

    let data = {};

    for (const [sampleTestAnnotation, dataset] of Object.entries(datasetTranslations)) {

      console.log(`[DEBUG] Fetch starting....:${sampleTestAnnotation}`)

      if (statusData?.[sampleTestAnnotation]?.status === "finished") {
        return statusData;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/videos/benchmark`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dataset })
        });
      
        if (!res.ok) {
          console.log(`[DEBUG] Error response ....`)
          throw new Error("[DEBUG] Request failed");
        }

        console.log(`[DEBUG] Data response....`)

        data[sampleTestAnnotation] = await res.json();

        console.log(`[DEBUG] UseEffect ${sampleTestAnnotation} => ${JSON.stringify(data)}`)
        
      } catch (err) {
        console.log(`[DEBUG] err... ${err}`)
        setStatusData({ status: "error", message: "Failed to fetch status" });
      } finally {
        setLoading(false);
      }
    }

    // setStatusData({ sampleTestAnnotation: data });
    setStatusData(data);
    return data;

  };

  useEffect(() => {
    console.log(`[DEBUG] UseEffect started to load First`)
    fetchStatus();
    // fetchStatus("second");
  }, []);
  
  console.log(`[DEBUG] => statusData =-> ${JSON.stringify(statusData)}`)

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
            className="slider-area slider-style-1 variation-default"
            data-black-overlay="1"
          >
          {JSON.stringify(statusData) == "{}" && (
              <CenteredLoader />
            )}
            <div className="container" style={{ height: '100%', top: '100px' }}>
              <>
              {statusData?.first && (
                <div className="row justify-content-center">
                  <DebugBoundary>
                    <MetricsTable
                      data={statusData.first}
                      title={"Benchmark of SoccerNet models into Amateur fut11 dataset (10 videos)"}
                      dataset={datasetTranslations.first}
                    />
                  </DebugBoundary>
                </div>
              )}
              {statusData?.second && (
                <div className="row justify-content-center">
                <DebugBoundary>
                  <MetricsTable
                    data={statusData.second}
                    title={"Benchmark of SoccerNet models into Amateur fut11 dataset (20 videos)"}
                    dataset={datasetTranslations.second}
                  />
                </DebugBoundary>
              </div>
              )}
              </>
            </div>
          </div>
          <Footer />
          <Copyright />
        </Context>
      </main>
    </>
  );
}
