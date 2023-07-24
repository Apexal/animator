import { useRef } from "preact/hooks";

interface Props {
  imageURL: string;
}

export function Scanner(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onLoad = () => {
    // Always make the canvas match the size of the image
    if (imageRef.current && canvasRef.current) {
      canvasRef.current.width = imageRef.current.width;
      canvasRef.current.height = imageRef.current.height;
    }
  };

  return <div class="relative">
    <img ref={imageRef} onLoad={onLoad} src={props.imageURL} />
    <canvas ref={canvasRef} class="absolute top-0 left-0 border rounded-lg"></canvas>
  </div>
}
