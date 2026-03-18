/**
 * Web Worker for Echogram data decimation
 * 
 * Offloads heavy filtering and decimation operations to prevent
 * jank on low-end Android devices.
 */

self.onmessage = (event) => {
  const { type, data } = event.data;

  if (type === 'decimate') {
    const { imageData, decimationFactor, stride } = data;
    const result = decimateData(imageData, decimationFactor, stride);
    self.postMessage({ type: 'decimate-result', result });
  } else if (type === 'filter') {
    const { buffer, windowSize } = data;
    const result = movingAverageFilter(buffer, windowSize);
    self.postMessage({ type: 'filter-result', result });
  }
};

/**
 * Decimate image data for lower resolution processing
 */
function decimateData(imageData, factor = 2, stride = 4) {
  const { data, width, height } = imageData;
  const newWidth = Math.ceil(width / factor);
  const newHeight = Math.ceil(height / factor);
  const decimated = new Uint8ClampedArray(newWidth * newHeight * 4);

  let outIdx = 0;
  for (let y = 0; y < height; y += factor) {
    for (let x = 0; x < width; x += factor) {
      const inIdx = (y * width + x) * 4;
      
      // Average stride pixels
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let dy = 0; dy < factor && y + dy < height; dy++) {
        for (let dx = 0; dx < factor && x + dx < width; dx += stride) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          a += data[idx + 3];
          count++;
        }
      }
      
      decimated[outIdx] = Math.round(r / count);
      decimated[outIdx + 1] = Math.round(g / count);
      decimated[outIdx + 2] = Math.round(b / count);
      decimated[outIdx + 3] = Math.round(a / count);
      outIdx += 4;
    }
  }

  return {
    data: decimated,
    width: newWidth,
    height: newHeight,
  };
}

/**
 * Moving average filter for smoothing
 */
function movingAverageFilter(buffer, windowSize = 5) {
  const filtered = new Float32Array(buffer.length);
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < buffer.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - halfWindow); j < Math.min(buffer.length, i + halfWindow + 1); j++) {
      sum += buffer[j];
      count++;
    }

    filtered[i] = sum / count;
  }

  return filtered;
}
