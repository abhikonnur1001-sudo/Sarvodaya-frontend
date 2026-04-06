export const enterFullscreen = async () => {
    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }
    } catch (err) {
        console.warn("Fullscreen not supported:", err);
    }
};

export const exitFullscreen = async () => {
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
    } catch (err) {
        console.warn("Exit fullscreen error:", err);
    }
};