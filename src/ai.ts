import * as bodyPix from "@tensorflow-models/body-pix";
import { BodyPixInput } from "@tensorflow-models/body-pix/dist/types";
import * as poseDetection from "@tensorflow-models/pose-detection";

export function loadBodyModel() {
  return bodyPix.load({
    architecture: "ResNet50",
    outputStride: 16,
    quantBytes: 2,
  });
}

export function predict(net: bodyPix.BodyPix, image: BodyPixInput) {
  return net.segmentPersonParts(image, {
    internalResolution: "medium",
    segmentationThreshold: 0.7,
    maxDetections: 1,
  });
}

export function createPoseDetector() {
  return poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, {
    runtime: "tfjs",
    enableSmoothing: false,
    enableSegmentation: false,
  });
}
