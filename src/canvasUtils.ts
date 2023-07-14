import * as bodyPix from "@tensorflow-models/body-pix";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { bodyPartGroups } from "./body";

export function drawMarkers(
  canvas: HTMLCanvasElement,
  pose: poseDetection.Pose | null
) {
  const ctx = canvas.getContext("2d");
  const radius = 5;

  if (!pose || !ctx) {
    return;
  }

  ctx.font = "15px sans-serif";
  for (const keypoint of pose.keypoints) {
    ctx.beginPath();
    ctx.arc(keypoint.x, keypoint.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = "red";
    ctx.fill();
    if (keypoint.name) {
      ctx.fillText(keypoint.name, keypoint.x + 10, keypoint.y + 10);
    }
  }
}

export function drawBodyPartGroup(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  segmentation: bodyPix.SemanticPartSegmentation,
  bodyPartGroup: keyof typeof bodyPartGroups
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const bodyMask = bodyPix.toMask(
    segmentation,
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 0, g: 0, b: 0, a: 0 },
    false,
    Array.from(bodyPartGroups[bodyPartGroup].values())
  );

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  ctx.putImageData(bodyMask, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.drawImage(img, 0, 0);
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(resolve, "image/png");
  });
}
