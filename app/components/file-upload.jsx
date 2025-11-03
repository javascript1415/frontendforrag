"use client";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  HardDrive,
  Database,
  Check,
} from "lucide-react";
import React, { useState, useRef } from "react";
import "./FileUploadComponent.css";

const FileUploadComponent = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [uploadStatus, setUploadStatus] = useState({ state: "idle" });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleBrowseFiles = () => {
    fileInputRef.current?.click();
  };

  const simulateProcessingSteps = () => {
    setTimeout(
      () =>
        setUploadStatus({
          state: "processing",
          message: "Processing document...",
        }),
      1000
    );
    setTimeout(
      () =>
        setUploadStatus({
          state: "embedding",
          message: "Creating vector embeddings...",
        }),
      2400
    );
    setTimeout(
      () =>
        setUploadStatus({
          state: "storing",
          message: "Storing in database...",
        }),
      3800
    );
    setTimeout(() => {
      setUploadStatus({
        state: "success",
        message: "Document uploaded successfully!",
      });
      onUploadSuccess?.();
      setTimeout(() => setUploadStatus({ state: "idle" }), 1300);
    }, 5200);
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploadStatus({ state: "idle" });

    const supportedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "text/plain",
      "text/csv",
    ];

    const formData = new FormData();

    for (const file of Array.from(files)) {
      if (!supportedTypes.includes(file.type)) {
        setUploadStatus({
          state: "error",
          message: "Supported formats: PDF, DOCX, JPEG, PNG, TXT, CSV",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadStatus({
          state: "error",
          message: "One or more files exceed the 5MB limit",
        });
        return;
      }

      formData.append("uploads", file);
    }

    if (documentTitle) {
      formData.append("title", documentTitle);
    }

    try {
      setUploadStatus({
        state: "uploading",
        message: "Uploading files...",
        progress: 0,
      });

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        if (progress > 100) {
          clearInterval(progressInterval);
          return;
        }
        setUploadStatus((prev) => ({ ...prev, progress }));
      }, 300);

      const res = await fetch("http://localhost:8001/api/v1/uploads/pdf", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      clearInterval(progressInterval);

      if (!res.ok) throw new Error(await res.text());

      setDocumentTitle("");
      simulateProcessingSteps();
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        state: "error",
        message: "Failed to upload documents",
      });
    }
  };

  const getStepStatus = (step) => {
    const completedSteps = {
      idle: [],
      uploading: [],
      processing: ["upload"],
      embedding: ["upload", "process"],
      storing: ["upload", "process", "embedding"],
      success: ["upload", "process", "embedding", "storage"],
      error: [],
    };

    const activeStep = {
      idle: "",
      uploading: "upload",
      processing: "process",
      embedding: "embedding",
      storing: "storage",
      success: "",
      error: "",
    };

    if (activeStep[uploadStatus.state] === step) return "active";
    if (completedSteps[uploadStatus.state].includes(step)) return "completed";
    return "pending";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Upload className="text-blue-500" size={20} />
        <h2 className="text-xl font-semibold">Document Upload</h2>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-700"
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleBrowseFiles}
      >
        <div className="text-gray-400 mb-4">
          <Upload size={48} />
        </div>
        <p className="text-gray-600 text-center mb-4">
          Drag and drop your files here, or click to browse
        </p>
        <Button className="browsebtn" variant="outline">
          Browse Files
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Supported files: PDF, DOCX, JPEG, PNG, TXT, CSV (Max size: 5MB each)
      </p>

      {uploadStatus.state !== "idle" && (
        <div
          className={`p-3 rounded-md ${
            uploadStatus.state === "success"
              ? "bg-green-50 text-green-700"
              : uploadStatus.state === "error"
              ? "bg-red-50 text-red-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {["uploading", "processing", "embedding", "storing"].includes(
              uploadStatus.state
            ) && <Loader2 className="h-4 w-4 animate-spin" />}
            {uploadStatus.state === "success" && (
              <CheckCircle className="h-4 w-4" />
            )}
            {uploadStatus.state === "error" && <XCircle className="h-4 w-4" />}
            <span>{uploadStatus.message}</span>
          </div>
          {uploadStatus.state === "uploading" &&
            uploadStatus.progress !== undefined && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${uploadStatus.progress}%` }}
                ></div>
              </div>
            )}
        </div>
      )}

      <div className="mt-6 ">
        <h3 className="font-medium mb-4">Document Processing Pipeline</h3>
        <div className="flex items-center justify-between relative">
          <div
            className="absolute h-[2px] bg-gray-200 top-6 left-0 right-0 -translate-y-1/2 z-0 "
            style={{
              width: "90%",
              left: "20px",
              maxWidth: "390px",
            }}
          ></div>
          <div
            className="absolute h-[2px] bg-blue-500 top-1/2 left-0 -translate-y-1/2 z-10 transition-all duration-500"
            style={{
              width:
                uploadStatus.state === "idle"
                  ? "0%"
                  : uploadStatus.state === "uploading"
                  ? "8%"
                  : uploadStatus.state === "processing"
                  ? "33%"
                  : uploadStatus.state === "embedding"
                  ? "66%"
                  : uploadStatus.state === "storing"
                  ? "90%"
                  : uploadStatus.state === "success"
                  ? "100%"
                  : "0%",
            }}
          ></div>

          {["upload", "process", "embedding", "storage"].map((step, index) => {
            const stepIcons = {
              upload: <Upload className="w-5 h-5 text-gray-500" />,
              process: (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-600"
                >
                  <path d="M12 3v3m0 12v3M9 3h6M9 21h6M5.5 8.5l1.5 1.25M18.5 15.5l-1.5-1.25M3 12h3m12 0h3M5.5 15.5l1.5-1.25M18.5 8.5l-1.5 1.25" />
                </svg>
              ),
              embedding: <Database className="w-5 h-5 text-gray-500" />,
              storage: <HardDrive className="w-5 h-5 text-gray-500" />,
            };

            const status = getStepStatus(step);

            return (
              <div className="flex flex-col items-center z-20" key={index}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                    status === "active"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-300"
                      : status === "completed"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 border-2 border-gray-300"
                  }`}
                >
                  {status === "active" ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : status === "completed" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepIcons[step]
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    status !== "pending" ? "text-blue-600" : "text-gray-500"
                  } hidden md:inline`}
                >
                  {step === "embedding"
                    ? "Embedding"
                    : step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.jpeg,.jpg,.png,.txt,.csv"
        multiple
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        className="hidden"
      />
    </div>
  );
};

export default FileUploadComponent;
