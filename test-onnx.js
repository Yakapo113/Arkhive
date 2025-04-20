const ort = require('onnxruntime-node');

if (ort.InferenceSession) {
  console.log('ONNX Runtime loaded successfully.');
} else {
  console.log('ONNX Runtime failed to load.');
}
