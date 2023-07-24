import { setBackend } from "@tensorflow/tfjs";
import { useEffect, useState } from "preact/hooks";
import { createPoseDetector, loadBodyModel } from "./ai";
import { PoseDetector } from "@tensorflow-models/pose-detection";
import { BodyPix } from "@tensorflow-models/body-pix";
import { Scanner } from "./Scanner";

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
    <main class="container mx-auto py-10">
      <h1 class="text-5xl font-bold mb-5">Wrathskeller Prototype</h1>
      {isLoadingModels ? (
        <div class="bg-amber-300 p-3 rounded-lg mb-5">
          <p>Loading AI models...</p>
        </div>
      ) : <Scanner bodyModel={bodyModel} poseDetector={poseDetector} width={500} imageURL="/guy.jpg" />}
    </main>
  );
}
