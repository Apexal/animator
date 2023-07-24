import { setBackend } from "@tensorflow/tfjs";
import { useEffect, useState } from "preact/hooks";
import { createPoseDetector, loadBodyModel } from "./ai";
import { PoseDetector } from "@tensorflow-models/pose-detection";
import { BodyPix } from "@tensorflow-models/body-pix";

export function App() {
  // Tensorflow models
  const [poseDetector, setPoseDetector] = useState<PoseDetector | null>(null);
  const [bodyModel, setBodyModel] = useState<BodyPix | null>(null);

  // Load Tensorflow models
  useEffect(() => {
    setBackend("webgl").then(() => {
      createPoseDetector().then(setPoseDetector);
      loadBodyModel().then(setBodyModel);
    });

    // Cleanup the memory allocated to these models
    return () => {
      poseDetector?.dispose();
      setPoseDetector(null);
      bodyModel?.dispose();
      setBodyModel(null);
    }
  }, []);

  const isLoadingModels = !(poseDetector && bodyModel);
  
  return (
    <main>
      <h1>Wrathskeller Prototype</h1>
      {isLoadingModels && (
        <div>
          <p>Loading AI models...</p>
        </div>
      )}
    </main>
  );
}
