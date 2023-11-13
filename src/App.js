import { useEffect, useRef } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Button } from "@chakra-ui/react";

import "./App.css";
import BACKGROUND from './img/bg.jpeg';

function App() {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();

  useEffect(() => {
    contextRef.current = canvasRef.current.getContext("2d");
    const constraints = {
      video: { width: { min: 1280 }, height: { min: 720 } },
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      inputVideoRef.current.srcObject = stream;
      sendToMediaPipe();
    });

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: true,
    });

    selfieSegmentation.onResults(onResults);

    const sendToMediaPipe = async () => {
      if (!inputVideoRef.current.videoWidth) {
        console.log(inputVideoRef.current.videoWidth);
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };
  }, []);

  const onResults = (results) => {
    contextRef.current.save();
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    contextRef.current.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Only overwrite existing pixels.
    contextRef.current.globalCompositeOperation = "source-out";

    // use background image
    const img = new Image(1280, 720);

    // TODO: Figure out how to switch between images
    img.src = BACKGROUND;
    const pat = contextRef.current.createPattern(img, "no-repeat");
    contextRef.current.fillStyle = pat;


    // contextRef.current.fillStyle = "#00FFFF";
    contextRef.current.fillRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Only overwrite missing pixels.
    contextRef.current.globalCompositeOperation = "destination-atop";
    contextRef.current.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // contextRef.current.restore();
  };

  function downloadImage()
  {
      var canvas = document.getElementById("canvas");
      var image = canvas.toDataURL();

      const link = document.createElement('a');
      link.style.display = 'none';
      document.body.appendChild(link)
      link.setAttribute('download', 'diwali.jpg');
      link.setAttribute('href', image.replace("image/jpg", "image/octet-stream"));
      link.click();
  }

  return (
    <div className="App">
      <video id="background" autoPlay style={{"display": "none"}} ref={inputVideoRef} />
      <canvas id="canvas" ref={canvasRef} width={1280} height={720} />
      <Button onClick={downloadImage}>Download</Button>
    </div>
  );
}

export default App;