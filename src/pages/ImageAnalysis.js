
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./ImageAnalysis.css";

const API_URL = "http://localhost:5000";

export default function ImageAnalysis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setError("");
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      setPreview("");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setFile(null);
      setPreview("");
      setError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setPreview("");
      setError("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a chest X-ray image first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `${API_URL}/api/analysis/image`,
        formData,
        { timeout: 60000 }
      );

      const data = response.data;

      if (data?.success === false) {
        throw new Error(
          data.message || "Image analysis failed."
        );
      }

      const condition = data?.condition || data?.prediction;

      if (
        typeof condition !== "string" ||
        condition.trim() === ""
      ) {
        throw new Error(
          data?.message ||
            "No prediction was returned by the ML service."
        );
      }

      const confidence =
        typeof data.confidence === "number" &&
        Number.isFinite(data.confidence) &&
        data.confidence >= 0 &&
        data.confidence <= 1
          ? data.confidence
          : null;

      setResult({
        condition: condition.trim(),
        confidence,
        modelName: data.modelName || null,
        disclaimer:
          data.disclaimer ||
          "Educational prototype only. This model has not been clinically validated and is not a diagnostic tool.",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Image analysis failed. Check that the Node.js backend and Flask ML service are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");

    const input = document.getElementById("medical-file");
    if (input) {
      input.value = "";
    }
  };

  const isNormal =
    result?.condition?.toLowerCase() === "normal";

  return (
    <>
      <Navbar />

      <main className="image-analysis-page">
        <div className="image-analysis-container">
          <h1>AI Medical Image Analysis</h1>

          <p className="image-analysis-subtitle">
            Upload a chest X-ray for AI-assisted image
            classification.
          </p>

          <form
            className="image-analysis-card"
            onSubmit={handleAnalyze}
          >
            <label
              htmlFor="medical-file"
              className="upload-label"
            >
              Select Chest X-ray
            </label>

            <input
              id="medical-file"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              disabled={loading}
            />

            {preview && (
              <div className="scan-preview">
                <img
                  src={preview}
                  alt="Selected chest X-ray preview"
                />
                <p>{file?.name}</p>
              </div>
            )}

            <div className="image-analysis-actions">
              <button
                type="submit"
                className="analyze-image-button"
                disabled={!file || loading}
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze with AI"}
              </button>

              {file && (
                <button
                  type="button"
                  className="clear-image-button"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {error && (
              <p
                className="image-analysis-error"
                role="alert"
              >
                {error}
              </p>
            )}
          </form>

          {result && (
            <section className="image-analysis-result">
              <h2>Analysis Result</h2>

              <div
                className={`prediction-status ${
                  isNormal
                    ? "normal-result"
                    : "review-result"
                }`}
              >
                <span className="prediction-label">
                  Model classification
                </span>

                <h3>{result.condition.toUpperCase()}</h3>

                <p>
                  The model assigned this image to its{" "}
                  <strong>
                    {result.condition.toUpperCase()}
                  </strong>{" "}
                  category.
                </p>
              </div>

              {result.confidence !== null && (
                <div className="confidence-section">
                  <p>
                    <strong>Model confidence:</strong>{" "}
                    {(result.confidence * 100).toFixed(1)}%
                  </p>

                  <div
                    className="confidence-track"
                    role="progressbar"
                    aria-label="Model confidence"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={result.confidence * 100}
                  >
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${
                          result.confidence * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {result.modelName && (
                <p>
                  <strong>Model:</strong> {result.modelName}
                </p>
              )}

              

              <p className="image-analysis-disclaimer">
                {result.disclaimer} Consult a qualified
                healthcare professional for interpretation.
              </p>

            </section>
          )}

          <p className="image-analysis-disclaimer">
            This tool is for educational use only and is not a
            substitute for professional radiology review or
            medical advice. Use only image types supported by
            your trained model.
          </p>
        </div>
      </main>
    </>
  );
}
