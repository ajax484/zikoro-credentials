import React, { useState, useCallback, useEffect } from "react";
import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlaybackRateButton,
  MediaPlayButton,
  MediaSeekBackwardButton,
  MediaSeekForwardButton,
  MediaMuteButton,
  MediaFullscreenButton,
} from "media-chrome/react";
import {
  MediaProvider,
  useMediaDispatch,
  useMediaSelector,
  useMediaRef,
  useMediaFullscreenRef,
  MediaActionTypes,
} from "media-chrome/react/media-store";
import { cn } from "@/lib/utils";
import {
  ArrowsInSimple,
  ArrowsOutSimple,
  CornersIn,
  CornersOut,
  Info,
  Pause,
  Play,
  SpeakerHigh,
  SpeakerX,
  X,
} from "@phosphor-icons/react";
import ReactPlayer from "react-player";

function VideoHelper() {
  const [showVideo, setShowVideo] = useState(false);
  const [videoSize, setVideoSize] = useState("normal");

  const handleToggleVideo = useCallback(() => {
    setShowVideo((prev) => !prev);
  }, []);

  const handleCloseVideo = useCallback(() => {
    setShowVideo(false);
    setVideoSize("normal");
  }, []);

  const handleVideoSizeToggle = useCallback(() => {
    setVideoSize((prev) => (prev === "normal" ? "large" : "normal"));
  }, []);

  // Close video on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showVideo) {
        handleCloseVideo();
      }
    };

    if (showVideo) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showVideo, handleCloseVideo]);

  const Video = React.memo(() => {
    const mediaRef = useMediaRef();

    return (
      <ReactPlayer
        ref={mediaRef}
        slot="media"
        src="https://stream.mux.com/maVbJv2GSYNRgS02kPXOOGdJMWGU1mkA019ZUjYE7VU7k"
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          "--controls": "none",
        }}
      ></ReactPlayer>
    );
  });

  const PlayerContainer = ({ children }) => {
    const mediaFullscreenRef = useMediaFullscreenRef();

    return (
      <div
        ref={mediaFullscreenRef}
        className="relative w-full h-full bg-black rounded-lg overflow-hidden"
      >
        {children}
      </div>
    );
  };

  const CustomControls = () => {
    const dispatch = useMediaDispatch();
    const mediaPaused = useMediaSelector((state) => state.mediaPaused);
    const mediaMuted = useMediaSelector((state) => state.mediaMuted);
    const mediaIsFullscreen = useMediaSelector(
      (state) => state.mediaIsFullscreen
    );

    const handlePlayPause = useCallback(() => {
      const type = mediaPaused
        ? MediaActionTypes.MEDIA_PLAY_REQUEST
        : MediaActionTypes.MEDIA_PAUSE_REQUEST;
      dispatch({ type });
    }, [dispatch, mediaPaused]);

    const handleMute = useCallback(() => {
      const type = mediaMuted
        ? MediaActionTypes.MEDIA_UNMUTE_REQUEST
        : MediaActionTypes.MEDIA_MUTE_REQUEST;
      dispatch({ type });
    }, [dispatch, mediaMuted]);

    const handleFullscreen = useCallback(() => {
      const type = mediaIsFullscreen
        ? MediaActionTypes.MEDIA_EXIT_FULLSCREEN_REQUEST
        : MediaActionTypes.MEDIA_ENTER_FULLSCREEN_REQUEST;
      dispatch({ type });
    }, [dispatch, mediaIsFullscreen]);

    // const handleRewind = useCallback(() => {
    //   const type = mediaCurrentTime > 5 ? MediaActionTypes.MEDIA_SEEK_REQUEST : null;
    //   dispatch({ type });
    // }

    return (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label={mediaPaused ? "Play" : "Pause"}
            >
              {mediaPaused ? <Play size={20} /> : <Pause size={20} />}
            </button>

            <button
              onClick={handleMute}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label={mediaMuted ? "Unmute" : "Mute"}
            >
              {mediaMuted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!mediaIsFullscreen && (
              <button
                onClick={handleVideoSizeToggle}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                aria-label={
                  videoSize === "normal" ? "Expand video" : "Shrink video"
                }
              >
                {videoSize === "normal" ? (
                  <ArrowsOutSimple size={20} />
                ) : (
                  <ArrowsInSimple size={20} />
                )}
              </button>
            )}

            <button
              onClick={handleFullscreen}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label={
                mediaIsFullscreen ? "Exit fullscreen" : "Enter fullscreen"
              }
            >
              {mediaIsFullscreen ? (
                <CornersIn size={20} />
              ) : (
                <CornersOut size={20} />
              )}
            </button>

            <button
              onClick={handleCloseVideo}
              className="hover:bg-white/20 p-2 rounded-full transition-colors"
              aria-label="Close video"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getVideoContainerClasses = () => {
    if (!showVideo) return "hidden";

    const baseClasses = "fixed z-[100] bg-zikoroBlack rounded-lg shadow-2xl";

    if (videoSize === "large") {
      return cn(
        baseClasses,
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "w-[min(90vw,800px)] aspect-video",
        "animate-in zoom-in-95 duration-200"
      );
    }

    return cn(
      baseClasses,
      "left-1/2 -translate-x-1/2 md:translate-x-0 bottom-4 md:right-4 w-[350px] aspect-video",
      "animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-200"
    );
  };

  return (
    <>
      {/* Backdrop for large video */}
      {showVideo && videoSize === "large" && (
        <div
          className="fixed inset-0 bg-black/50 z-[99] animate-in fade-in duration-200"
          onClick={handleCloseVideo}
        />
      )}

      {/* Help Video Button */}
      <button
        onClick={handleToggleVideo}
        aria-label="Help video"
        className={cn(
          "fixed bottom-4 right-4 z-[98] flex gap-2 items-center justify-center",
          "bg-zikoroBlack hover:bg-zikoroBlack/90 p-3 text-white rounded-lg",
          "shadow-lg transition-all duration-200 hover:scale-105",
          showVideo && videoSize === "normal" && "bottom-[250px]" // Move up when video is showing
        )}
      >
        <Info size={20} />
        <span className="text-sm font-medium">Watch Help Video</span>
      </button>

      {/* Video Player */}
      <div className={getVideoContainerClasses()}>
        <MediaProvider>
          <MediaController
            style={{
              width: "100%",
              height: "100%",
              "--media-control-bar-display": "none", // Hide default controls
            }}
          >
            <PlayerContainer>
              <Video />
              <CustomControls />
            </PlayerContainer>

            {/* Hidden default controls for accessibility */}
            <MediaControlBar style={{ display: "none" }}>
              <MediaPlayButton />
              <MediaSeekBackwardButton />
              <MediaSeekForwardButton />
              <MediaTimeRange />
              <MediaTimeDisplay showDuration />
              <MediaMuteButton />
              <MediaVolumeRange />
              <MediaPlaybackRateButton />
              <MediaFullscreenButton />
            </MediaControlBar>
          </MediaController>
        </MediaProvider>
      </div>
    </>
  );
}

export default VideoHelper;
