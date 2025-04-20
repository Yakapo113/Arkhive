const ort = require('onnxruntime-node');
const fs = require('fs');
const path = require('path');

async function runModel() {
  try {
    const modelPath = path.join(__dirname, 'models', 'mnist.onnx');
    const session = await ort.InferenceSession.create(modelPath);

    console.log('✅ Model loaded successfully:', modelPath);
    console.log('🔍 Input names:', session.inputNames);
    console.log('📤 Output names:', session.outputNames);
  } catch (err) {
    console.error('❌ Failed to load model:', err);
  }
}

runModel();
