import { useEffect, useRef, useState } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import {
  Button,
  Box,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  Grid,
  GridItem,
  Image as ChakraImage,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  VStack,
  Kbd,
} from "@chakra-ui/react";

import "./App.css";
import BACKGROUND1 from "./img/bg1.jpeg";
import BACKGROUND2 from "./img/bg2.jpeg";
import BACKGROUND3 from "./img/bg3.jpeg";
import BACKGROUND4 from "./img/bg4.jpeg";
import BACKGROUND5 from "./img/bg5.jpeg";
import BACKGROUND6 from "./img/bg6.jpeg";
import BACKGROUND7 from "./img/bg7.jpeg";
import BACKGROUND8 from "./img/bg8.jpeg";
import BACKGROUND9 from "./img/bg9.webp";

function App() {
  const inputVideoRef = useRef();
  const canvasRef = useRef();
  const contextRef = useRef();

  const backgrounds = [
    BACKGROUND1,
    BACKGROUND2,
    BACKGROUND3,
    BACKGROUND4,
    BACKGROUND5,
    BACKGROUND6,
    BACKGROUND7,
    BACKGROUND8,
    BACKGROUND9,
  ];
  const [background, setBackground] = useState(BACKGROUND1);

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
      selfieMode: false,
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
  }, [background]);

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
    img.src = background;
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

  const { isOpen, onOpen, onClose } = useDisclosure();

  function downloadImage() {
    var canvas = document.getElementById("canvas");
    var image = canvas.toDataURL();

    const link = document.createElement("a");
    link.style.display = "none";
    document.body.appendChild(link);
    link.setAttribute("download", "diwali.jpg");
    link.setAttribute("href", image.replace("image/jpg", "image/octet-stream"));
    link.click();
  }

  function handleKeyDown(e) {
    if (e.code === "Space") {
      downloadImage();
    }
  }

  const changeBackground = (item) => (event) => {
    setBackground(item);
    onClose();
  };

  return (
    <Box className="App" justifyItems="center" onKeyDown={handleKeyDown} tabIndex={0}>
      <video
        id="background"
        autoPlay
        style={{ display: "none" }}
        ref={inputVideoRef}
      />
      <canvas
        id="canvas"
        ref={canvasRef}
        width={1216}
        height={684}
        style={{ margin: "0px auto", border: "10px solid red" }}
      />
      <HStack
        alignItems="center"
        justifyContent="space-evenly"
        width="100%"
        my="10px">
        <Button onClick={onOpen} colorScheme="blue">
          Choose Background
        </Button>
        <Button onClick={downloadImage} colorScheme="red">
          <div>
            Take Photo {" "}<Kbd color="black">space</Kbd>
          </div>
        </Button>
      </HStack>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="xl"
        motionPreset="slideInBottom"
        scrollBehavior
        isCentered>
        <ModalOverlay />
        <ModalBody>
          <ModalContent maxWidth="95%" height="fit-content">
            <ModalHeader>Background Select</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Grid
                templateRows="repeat(3, 1fr)"
                templateColumns="repeat(3, 1fr)"
                gap={6}
                bg="lightgray"
                alignItems="center"
                borderRadius="10px"
                padding="10px">
                {backgrounds.map((item) => (
                  <GridItem w="100%" h="100%" bg="darkgray" key={item}>
                    <VStack>
                      <ChakraImage src={item} />
                      <Button
                        onClick={changeBackground(item)}
                        size="sm"
                        position="absolute"
                        my="200px">
                        Use
                      </Button>
                    </VStack>
                  </GridItem>
                ))}
              </Grid>
            </ModalBody>
          </ModalContent>
        </ModalBody>
      </Modal>
    </Box>
  );
}

export default App;
