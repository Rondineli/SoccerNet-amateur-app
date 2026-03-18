import { useState, useMemo } from "react";

export default function IdSearch({ retry, onSubmit, onCenter, modelType, setModelType }) {
  const [id, setId] = useState("");
    
  const retryUntil = (fn, shouldStop, intervalMs = 10_000) => {
    const timer = setInterval(async () => {
      const result = await fn();
      if (shouldStop(result)) {
        clearInterval(timer);
      }
    }, intervalMs);
  
    return timer;
  };
  
  const handleSubmit = async () => {
    if (!id.trim()) return;

    const result = await onSubmit({
      id: id.trim(),
      modelType: modelType.trim(),
    });

    // retry until finished
    retryUntil(
      async () => {
        return onSubmit({
          id: id.trim(),
          modelType: modelType.trim(),
        });
      },
      (result) => result?.status === "finished" || !retry
    );
  };

  const containerStyle = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      marginBottom: "2rem",
      width: "100%",
      maxWidth: 700,
      padding: "0 1rem",
      boxSizing: "border-box",
      ...(!onCenter && {
        display: "none"
      }),
      ...(onCenter && {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }),
    }),
    [onCenter]
  );

  return (
    <>
        <div className="col-lg-12 d-flex justify-content-center align-items-center" style={{ height: '0vh' }}>
          <div style={containerStyle}>
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                background: "#fff",
                borderRadius: "999px",
                border: "1px solid #ccc",
                overflow: "hidden",
              }}
            >
                {/* Model Selection */}
                <select
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    style={{
                      border: "none",
                      flex: 1,
                      padding: "0 1rem",
                      height: "5%",
                      fontSize: "2rem",
                      background: "transparent",
                      outline: "none",
                      cursor: "pointer",
                      borderRight: "2px solid #ddd",
                    }}
                    >
                    <option value="json_soccernet_calf_resnetpca512_amateur_model_st_2">Transfer Learning model</option>
                    <option value="json_soccernet_calf_resnetpca512_amateur_model_no_tf">SoccerNet with amateur data</option>
                    <option value="json_soccernet_calf_resnetpca512">SoccerNet dataset model</option>
                </select>

                {/* YT ID Input Search*/}
                <input
                type="text"
                placeholder="Enter an ID to see its status."
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                style={{
                    flex: 1,
                    padding: "0.9rem 1rem",
                    fontSize: "2rem",
                    border: "none",
                    outline: "none",
                }}
                />

                {/* Button */}
                <button
                onClick={handleSubmit}
                style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "999px",
                    border: "none",
                    background: "#1a73e8",
                    color: "white",
                    cursor: "pointer",
                    margin: "0.25rem",
                    fontSize: "2rem",
                }}
                >
                Search
                </button>
            </div>
          </div>
        </div>
    </>
  );
}
