import { setBackend } from "@tensorflow/tfjs";

import { default as JSZip } from "jszip";

import "./main.css";
import { createPoseDetector, loadBodyModel, predict } from "./ai";
import { canvasToBlob, drawBodyPartGroup } from "./canvasUtils";
import { bodyPartGroups } from "./body";
import { generateSpineJSON } from "./spine";

/** Run when page content loads. */
async function init() {
  const poseDetector = await createPoseDetector();
  const net = await loadBodyModel();

  const imageURLS: string[] = [
    // "/jason.png",
    // "/frank.jpg",
    "/guy.jpg",
    // "/frank_suit.jpg"
  ];

  for (const imageURL of imageURLS) {
    const container = document.createElement("div");
    container.classList.add("container");

    // Create tag
    const tag = document.createElement("span");
    tag.classList.add("tag");
    tag.innerText = imageURL;
    container.appendChild(tag);

    // Create img
    const img = document.createElement("img");
    img.src = imageURL;
    container.appendChild(img);
    container.classList.add("loading");

    img.onload = async () => {
      // Create canvas
      const canvas = document.createElement("canvas");
      container.appendChild(canvas);

      canvas.width = img.width;
      canvas.height = img.height;

      // Segment body parts and detect pose
      const [segmentation, poses] = await Promise.all([
        predict(net, img),
        poseDetector.estimatePoses(img),
      ]);

      container.classList.remove("loading");

      const zip = new JSZip();

      for (const bodyPartGroup in bodyPartGroups) {
        drawBodyPartGroup(canvas, img, segmentation, bodyPartGroup);
        const canvasBlob = await canvasToBlob(canvas);
        if (canvasBlob) {
          zip.file(bodyPartGroup + ".png", canvasBlob);
        } else {
          console.warn("Null blob for " + bodyPartGroup);
        }
      }

      const skeleton = generateSpineJSON(canvas.width, canvas.height, poses[0]);
      console.log(JSON.stringify(skeleton, null, 2));

      zip.file("skeleton.json", JSON.stringify(skeleton, null, 2));

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const zipBlobURL = URL.createObjectURL(zipBlob);
      const downloadLink = document.getElementById(
        "download"
      ) as HTMLAnchorElement;
      downloadLink.href = zipBlobURL;
      downloadLink.download = "bodyParts.zip";
    };

    document.body.appendChild(container);
  }
}

document.addEventListener("DOMContentLoaded", () => setBackend("webgl").then(() => init()));
