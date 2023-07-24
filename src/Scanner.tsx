import { useRef, useState } from "preact/hooks";
import { predict } from "./ai";
import { PoseDetector } from "@tensorflow-models/pose-detection";
import { BodyPix } from "@tensorflow-models/body-pix";
import clsx from "clsx";

interface Props {
  poseDetector: PoseDetector;
  bodyModel: BodyPix;
  imageURL: string;
  width: number;
}

export function Scanner(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** Make the canvas match the size of the image */
  const resizeCanvas = () => {
    if (imageRef.current && canvasRef.current) {
      canvasRef.current.width = imageRef.current.width;
      canvasRef.current.height = imageRef.current.height;
    }
  }

  const onImageLoad = () => {
    resizeCanvas();
  };

  const scan = async () => {
    if (imageRef.current) {
      setIsLoading(true);

      const [segmentation, poses] = await Promise.all([
        predict(props.bodyModel, imageRef.current),
        props.poseDetector.estimatePoses(imageRef.current),
      ]);

      setIsLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div class="relative inline-block">
          <img
            ref={imageRef}
            onLoad={onImageLoad}
            src={props.imageURL}
            class={clsx("border opacity-25", isLoading && "blur-sm")}
            style={{ width: props.width }}
          />
          <canvas
            ref={canvasRef}
            class="absolute top-0 left-0 rounded-lg border"
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
