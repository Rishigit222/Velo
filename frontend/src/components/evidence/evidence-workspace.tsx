"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { evidenceService } from "@/services/evidenceService";
import {
  ConditionReport,
  ConditionReportCreateParams,
  EvidenceFile,
  EvidenceSession,
  Order,
  SessionType,
} from "@/types";
import { Button } from "@/components/ui/button";

interface EvidenceWorkspaceProps {
  order: Order;
  onSessionUpdated?: () => void;
}

export function EvidenceWorkspace({ order, onSessionUpdated }: EvidenceWorkspaceProps) {
  const [sessions, setSessions] = useState<EvidenceSession[]>([]);
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType>("delivery");
  const [isLoading, setIsLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Staged Files for Upload
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Live Camera & MediaRecorder State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<"photo" | "video">("photo");
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Condition Report Form State
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [isSubmittingCondition, setIsSubmittingCondition] = useState(false);
  const [conditionForm, setConditionForm] = useState<ConditionReportCreateParams>({
    product_condition: "Factory Sealed",
    packaging_condition: "Intact Pristine",
    accessories_status: "All Included",
    damage_description: "",
    additional_notes: "",
  });

  // 1. Fetch sessions for this order
  const loadSessions = useCallback(async () => {
    try {
      const data = await evidenceService.listSessions({ order_id: order.id });
      const detailed = await Promise.all(
        data.map((s) => evidenceService.getSession(s.id).catch(() => s))
      );
      setSessions(detailed);
    } catch {
      // Handle silently
    } finally {
      setIsLoading(false);
    }
  }, [order.id]);

  useEffect(() => {
    let active = true;
    evidenceService
      .listSessions({ order_id: order.id })
      .then(async (data) => {
        if (!active) return;
        const detailed = await Promise.all(
          data.map((s) => evidenceService.getSession(s.id).catch(() => s))
        );
        if (!active) return;
        setSessions(detailed);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [order.id]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const activeSession = sessions.find((s) => s.session_type === selectedSessionType) || null;

  // 2. Initiate session
  const handleInitiateSession = async (type: SessionType) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      const newSession = await evidenceService.createSession({
        order_id: order.id,
        session_type: type,
      });
      setActionSuccess(`Chain-of-custody ${type} evidence session #${newSession.id} initiated.`);
      await loadSessions();
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to initiate evidence session.");
    }
  };

  // 3. Complete session
  const handleCompleteSession = async (sessionId: number) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await evidenceService.updateStatus(sessionId, "completed");
      setActionSuccess(`Evidence session #${sessionId} marked as COMPLETED.`);
      await loadSessions();
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update session status.");
    }
  };

  // 4. Camera controls
  const startCamera = async () => {
    setActionError(null);
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: cameraMode === "video",
        });
      } catch {
        // Fallback without audio
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      setActionError(
        `Unable to access camera: ${err instanceof Error ? err.message : "Permission denied"}. You can use standard file uploads instead.`
      );
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCameraActive(false);
    setIsRecordingVideo(false);
    setRecordingSeconds(0);
  };

  const takePhotoSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const filename = `Capture-${selectedSessionType}-${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: "image/jpeg" });
        setStagedFiles((prev) => [...prev, file]);
        setActionSuccess(`Photo captured: ${filename}`);
      },
      "image/jpeg",
      0.92
    );
  };

  const startVideoRecording = () => {
    if (!mediaStreamRef.current) return;
    recordedChunksRef.current = [];
    try {
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(mediaStreamRef.current, { mimeType: mime });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const filename = `Video-${selectedSessionType}-${Date.now()}.webm`;
        const file = new File([blob], filename, { type: mime });
        setStagedFiles((prev) => [...prev, file]);
        setActionSuccess(`Video recording complete: ${filename} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      };

      recorder.start(500); // 500ms time slice
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } catch (err: unknown) {
      setActionError(`MediaRecorder failed: ${err instanceof Error ? err.message : "Codec not supported"}`);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecordingVideo) {
      mediaRecorderRef.current.stop();
      setIsRecordingVideo(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 5. File selection from disk
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setStagedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  // 6. Upload staged files to backend session
  const handleUploadStaged = async () => {
    if (!activeSession || stagedFiles.length === 0) return;
    setIsUploading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const uploaded = await evidenceService.uploadFiles(activeSession.id, stagedFiles);
      setActionSuccess(`Successfully uploaded ${uploaded.length} file(s) with SHA-256 hashes generated.`);
      setStagedFiles([]);
      stopCamera();
      await loadSessions();
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to upload evidence files.");
    } finally {
      setIsUploading(false);
    }
  };

  // 7. Submit condition report
  const handleSubmitCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;
    setIsSubmittingCondition(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await evidenceService.submitConditionReport(activeSession.id, conditionForm);
      setActionSuccess("Physical condition assessment report anchored to session.");
      setShowConditionForm(false);
      await loadSessions();
      if (onSessionUpdated) onSessionUpdated();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to submit condition report.");
    } finally {
      setIsSubmittingCondition(false);
    }
  };

  return (
    <div className="card-charcoal rounded-2xl p-6 sm:p-7 border border-white/[0.08] space-y-6">
      {/* ═══════════════════════════════════════
          HEADER & SESSION SELECTOR TABS
      ═══════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
            IMMUTABLE EVIDENCE CAPTURE
          </span>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
            <span>Chain-of-Custody Workspace</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#49B99A]/10 text-[#49B99A] border border-[#49B99A]/20">
              SHA-256 Verified
            </span>
          </h2>
        </div>

        {/* Tab switcher: Delivery vs Return */}
        <div className="flex items-center gap-1.5 p-1 bg-[#141416] border border-white/[0.08] rounded-xl shrink-0">
          <button
            onClick={() => {
              setSelectedSessionType("delivery");
              stopCamera();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              selectedSessionType === "delivery"
                ? "bg-[#1E1E22] text-white shadow-sm border border-white/[0.1]"
                : "text-[#777777] hover:text-[#D4D4D4]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#3867FF]" />
            <span>Delivery Dispatch</span>
          </button>
          <button
            onClick={() => {
              setSelectedSessionType("return");
              stopCamera();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              selectedSessionType === "return"
                ? "bg-[#1E1E22] text-white shadow-sm border border-white/[0.1]"
                : "text-[#777777] hover:text-[#D4D4D4]"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#D4A359]" />
            <span>Return Intake</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[#49B99A]/10 border border-[#49B99A]/25 text-[#49B99A] text-xs font-mono flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-[#49B99A]/70 hover:text-white">
            ✕
          </button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-mono flex items-center justify-between">
          <span>✕ {actionError}</span>
          <button onClick={() => setActionError(null)} className="text-rose-300/70 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          ACTIVE SESSION CONTROLS
      ═══════════════════════════════════════ */}
      {isLoading ? (
        <div className="p-8 text-center text-xs font-mono text-[#777777]">
          Querying evidence ledger for order #{order.id}...
        </div>
      ) : !activeSession ? (
        <div className="p-8 rounded-2xl bg-[#0E0E10] border border-white/[0.06] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#777777] mx-auto">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              No {selectedSessionType.toUpperCase()} Session Active
            </h3>
            <p className="text-xs text-[#777777] max-w-md mx-auto mt-1">
              Initialize a digital chain-of-custody session to capture photographic and video condition proof.
            </p>
          </div>
          <Button
            onClick={() => handleInitiateSession(selectedSessionType)}
            className="bg-[#3867FF] hover:bg-[#2F58DC] text-white px-5 py-2 text-xs font-medium rounded-xl"
          >
            + Initiate {selectedSessionType.toUpperCase()} Evidence Session
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Session Status Card */}
          <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold">
                Session #{activeSession.id} ({activeSession.session_type.toUpperCase()})
              </span>
              <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#A3A3A3] uppercase">
                {activeSession.session_status}
              </span>
              <span className="text-[#777777]">
                Started: {new Date(activeSession.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {activeSession.session_status === "active" && (
                <Button
                  onClick={() => handleCompleteSession(activeSession.id)}
                  variant="outline"
                  className="text-xs py-1 px-3 h-8 border-white/[0.1] text-white hover:bg-white/[0.08]"
                >
                  ✓ Complete Session
                </Button>
              )}
              <Link href={`/dashboard/verification?order_id=${order.id}`}>
                <Button
                  variant="outline"
                  className="text-xs py-1 px-3 h-8 border-[#3867FF]/30 text-[#88A8FF] hover:bg-[#3867FF]/10"
                >
                  Verification Vault →
                </Button>
              </Link>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              CAMERA & VIDEO CAPTURE DOCK
          ═══════════════════════════════════════ */}
          <div className="p-5 rounded-2xl bg-[#0A0A0C] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Media Capture & Ingestion
                </span>
                <span className="text-[11px] text-[#777777]">
                  Use live camera snapshot, short video recording, or select files from disk.
                </span>
              </div>

              {!isCameraActive ? (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setCameraMode("photo");
                      startCamera();
                    }}
                    className="bg-[#1E1E22] hover:bg-[#2A2A30] text-white border border-white/[0.12] text-xs px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5"
                  >
                    <span>📷 Open Camera</span>
                  </Button>
                  <Button
                    onClick={() => {
                      setCameraMode("video");
                      startCamera();
                    }}
                    className="bg-[#1E1E22] hover:bg-[#2A2A30] text-white border border-white/[0.12] text-xs px-3 py-1.5 h-8 rounded-xl flex items-center gap-1.5"
                  >
                    <span>🎥 Record Video</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="text-xs py-1 px-3 h-8 border-rose-500/30 text-rose-300 hover:bg-rose-500/10"
                >
                  ✕ Close Camera
                </Button>
              )}
            </div>

            {/* Live Camera Viewport */}
            {isCameraActive && (
              <div className="space-y-3">
                <div className="relative aspect-video max-h-[380px] w-full rounded-xl overflow-hidden bg-black border border-white/[0.12]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={cameraMode === "photo"}
                    className="w-full h-full object-cover"
                  />

                  {/* Mode / Timer Overlay */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium bg-black/80 backdrop-blur-md border border-white/20 text-white uppercase">
                      {cameraMode === "photo" ? "Photo Snapshot" : "Video Recording"}
                    </span>
                    {isRecordingVideo && (
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-mono text-[10px] animate-pulse">
                        REC {recordingSeconds}s
                      </span>
                    )}
                  </div>
                </div>

                {/* Shutter / Record Action Bar */}
                <div className="flex items-center justify-center gap-4 py-2">
                  {cameraMode === "photo" ? (
                    <Button
                      onClick={takePhotoSnapshot}
                      className="bg-white hover:bg-neutral-200 text-black px-6 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-black" />
                      <span>Take Photo Snapshot</span>
                    </Button>
                  ) : !isRecordingVideo ? (
                    <Button
                      onClick={startVideoRecording}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                      <span>Start Video Recording</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={stopVideoRecording}
                      className="bg-white hover:bg-neutral-200 text-black px-6 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg"
                    >
                      <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />
                      <span>Stop & Save Video</span>
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Disk File Picker Alternative */}
            <div className="pt-2">
              <label className="text-[11px] font-mono text-[#777777] block mb-2">
                Or upload JPEG, PNG, WebP, MP4, WebM from disk:
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
                onChange={handleFileInputChange}
                className="block w-full text-xs text-[#A3A3A3] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-white/[0.06] file:text-white hover:file:bg-white/[0.1] cursor-pointer"
              />
            </div>

            {/* Staged files review & upload trigger */}
            {stagedFiles.length > 0 && (
              <div className="p-4 rounded-xl bg-[#141416] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">
                    {stagedFiles.length} file(s) staged for cryptographic upload:
                  </span>
                  <button
                    onClick={() => setStagedFiles([])}
                    className="text-[11px] text-[#777777] hover:text-white font-mono"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {stagedFiles.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                    >
                      <span className="text-white truncate max-w-[260px]">{f.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[#777777]">{(f.size / 1024).toFixed(1)} KB</span>
                        <button
                          onClick={() => removeStagedFile(i)}
                          className="text-rose-400 hover:text-rose-200"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleUploadStaged}
                  disabled={isUploading}
                  className="bg-[#3867FF] hover:bg-[#2F58DC] text-white w-full py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Generating SHA-256 Hashes & Ingesting...</span>
                    </>
                  ) : (
                    <span>Upload {stagedFiles.length} File(s) to Custody Session</span>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════
              PHYSICAL CONDITION ASSESSMENT FORM
          ═══════════════════════════════════════ */}
          <div className="p-5 rounded-2xl bg-[#0A0A0C] border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-white block">
                  Physical Condition Assessment
                </span>
                <span className="text-[11px] text-[#777777]">
                  Document packaging state, accessories, and observed damage.
                </span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowConditionForm(!showConditionForm)}
                className="text-xs py-1 px-3 h-8 border-white/[0.1] text-white hover:bg-white/[0.08]"
              >
                {showConditionForm ? "Hide Form" : "+ Add Condition Report"}
              </Button>
            </div>

            {showConditionForm && (
              <form onSubmit={handleSubmitCondition} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#777777] uppercase block mb-1">
                      Product Condition
                    </label>
                    <select
                      value={conditionForm.product_condition}
                      onChange={(e) =>
                        setConditionForm({ ...conditionForm, product_condition: e.target.value })
                      }
                      className="w-full bg-[#141416] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Factory Sealed">Factory Sealed</option>
                      <option value="Pristine Condition">Pristine Condition</option>
                      <option value="Minor Wear">Minor Wear</option>
                      <option value="Visible Damage">Visible Damage</option>
                      <option value="Defective / Non-Functional">Defective / Non-Functional</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#777777] uppercase block mb-1">
                      Packaging State
                    </label>
                    <select
                      value={conditionForm.packaging_condition}
                      onChange={(e) =>
                        setConditionForm({ ...conditionForm, packaging_condition: e.target.value })
                      }
                      className="w-full bg-[#141416] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Intact Pristine">Intact Pristine</option>
                      <option value="Opened Box">Opened Box</option>
                      <option value="Damaged Box">Damaged Box</option>
                      <option value="Missing Original Packaging">Missing Original Packaging</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#777777] uppercase block mb-1">
                      Accessories Status
                    </label>
                    <select
                      value={conditionForm.accessories_status}
                      onChange={(e) =>
                        setConditionForm({ ...conditionForm, accessories_status: e.target.value })
                      }
                      className="w-full bg-[#141416] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="All Included">All Included</option>
                      <option value="Partially Included">Partially Included</option>
                      <option value="Missing Power Adapter">Missing Power Adapter</option>
                      <option value="Missing Cables">Missing Cables</option>
                      <option value="None Included">None Included</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#777777] uppercase block mb-1">
                    Damage Description & Inspection Notes
                  </label>
                  <textarea
                    rows={2}
                    value={conditionForm.damage_description || ""}
                    onChange={(e) =>
                      setConditionForm({ ...conditionForm, damage_description: e.target.value })
                    }
                    placeholder="Specific notes on scratches, seal state, serial number matching..."
                    className="w-full bg-[#141416] border border-white/[0.12] rounded-xl p-3 text-xs text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmittingCondition}
                    className="bg-[#49B99A] hover:bg-[#3EA689] text-black font-semibold text-xs px-5 py-2 rounded-xl"
                  >
                    {isSubmittingCondition ? "Submitting..." : "Save Condition Report"}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* ═══════════════════════════════════════
              EVIDENCE TIMELINE & FILES LEDGER
          ═══════════════════════════════════════ */}
          <div className="space-y-3">
            <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider block">
              ANCHORED FILES & AUDIT TIMELINE ({activeSession.files?.length || 0} media files)
            </span>

            {activeSession.files && activeSession.files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeSession.files.map((file: EvidenceFile) => (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-xl bg-[#0E0E10] border border-white/[0.06] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white truncate max-w-[200px]">
                        {file.file_name}
                      </span>
                      <a
                        href={evidenceService.getDownloadUrl(file.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#6B90FF] hover:underline text-[11px] font-mono"
                      >
                        Download ↗
                      </a>
                    </div>

                    <div className="p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono text-[#777777] break-all">
                      <span className="text-white/60">SHA-256: </span>
                      {file.file_hash}
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-[#777777]">
                      <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                      <span>{new Date(file.uploaded_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0E0E10] border border-white/[0.04] text-xs text-[#777777] font-mono text-center">
                No media files uploaded yet for this session.
              </div>
            )}

            {/* Condition Reports List */}
            {activeSession.condition_reports && activeSession.condition_reports.length > 0 && (
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-mono text-[#777777] uppercase block">
                  Condition Assessment Logs:
                </span>
                {activeSession.condition_reports.map((rep: ConditionReport) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-xl bg-[#0E0E10] border border-white/[0.04] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-white font-medium">{rep.product_condition}</span>
                      <span className="text-[#777777]">
                        {new Date(rep.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A3A3A3] flex gap-4 font-mono">
                      <span>Packaging: {rep.packaging_condition}</span>
                      <span>Accessories: {rep.accessories_status}</span>
                    </div>
                    {rep.damage_description && (
                      <p className="text-[11px] text-white/80 pt-1">{rep.damage_description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
