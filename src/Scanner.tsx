import { useEffect, useRef, useState } from "preact/hooks";
import { predict } from "./ai";
import { PoseDetector, Pose } from "@tensorflow-models/pose-detection";
import { BodyPix, SemanticPartSegmentation } from "@tensorflow-models/body-pix";
import clsx from "clsx";
import { bodyPartGroups } from "./body";
import { canvasToBlob, drawBodyPartGroup, drawMarkers } from "./canvasUtils";
import { default as JSZip } from "jszip";
import { generateSpineJSON } from "./spine";

interface Props {
  poseDetector: PoseDetector;
  bodyModel: BodyPix;
  imageURL: string;
  width: number;
}

export function Scanner(props: Props) {
  // Element references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [segmentation, setSegmentation] = useState<SemanticPartSegmentation | null>(null);
  const [pose, setPose] = useState<Pose | null>(null);

  // Actions

  /** Make the canvas match the size of the image */
  const resizeCanvas = () => {
    if (imageRef.current) {
      const { width, height } = imageRef.current;

      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }

      if (poseCanvasRef.current) {
        poseCanvasRef.current.width = width;
        poseCanvasRef.current.height = height;
      }
    }
  }
  
  /** Perform body segmentation and pose detection. */
  const scan = async () => {
    if (imageRef.current) {
      setIsLoading(true);

      const [segmentation, poses] = await Promise.all([
        predict(props.bodyModel, imageRef.current),
        props.poseDetector.estimatePoses(imageRef.current),
      ]);

      setSegmentation(segmentation);
      setPose(poses[0]);

      setIsLoading(false);
    }
  };
  
  /** Draw body parts */
  const draw = async () => {
    if (!canvasRef.current || !poseCanvasRef.current || !imageRef.current || !segmentation || !pose) {
      return;
    }

    const zip = new JSZip();

    drawMarkers(poseCanvasRef.current, pose);

    const bodyParts = Object.keys(bodyPartGroups);
    for (let i = 0; i < bodyParts.length; i++) {
      const bodyPartGroup = bodyParts[i];

      drawBodyPartGroup(canvasRef.current, imageRef.current, segmentation, bodyPartGroup);
      const canvasBlob = await canvasToBlob(canvasRef.current);
      if (canvasBlob) {
        zip.file(bodyPartGroup + ".png", canvasBlob);
      } else {
        console.warn("Null blob for " + bodyPartGroup);
      }
    }
    
    const skeleton = generateSpineJSON(canvasRef.current.width, canvasRef.current.height, pose);
    console.log(JSON.stringify(skeleton, null, 2));
    zip.file("skeleton.json", JSON.stringify(skeleton, null, 2));

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const zipBlobURL = URL.createObjectURL(zipBlob);
    location.href = zipBlobURL;
  }

  useEffect(() => {
    draw();
  }, [segmentation]);

  // Event handlers
  const onImageLoad = () => {
    resizeCanvas();
  };

  return (
    <div>
      <div>
        <div class="bg-gray-700 relative inline-block rounded-lg">
          <img
            ref={imageRef}
            onLoad={onImageLoad}
            src={props.imageURL}
            class={clsx("border opacity-25", isLoading && "blur-sm")}
            style={{ width: props.width }}
          />
          <canvas
            ref={canvasRef}
            class="absolute top-0 left-0"
          ></canvas>
          <canvas
            ref={poseCanvasRef}
            class="absolute top-0 left-0"
          ></canvas>
          {isLoading && (
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 bg-amber-300 rounded-lg">
              Scanning body and pose...
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        class="bg-amber-500 py-3 px-6 rounded-lg"
        onClick={scan}
      >
        Scan
      </button>
    </div>
  );
}
