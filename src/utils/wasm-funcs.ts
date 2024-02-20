import { Block } from '../store/editorSlice';

/**
  * Takes array buffer and passes it the FileProcessor in C++.
  */
export function processFile(arrayBuffer: ArrayBuffer, size: number, filename: string): boolean {
  const filenamePtr: number = allocateUTF8(filename);
  const fn = UTF8ToString(filenamePtr);
  // @ts-ignore
  const bufferPtr: number = window._malloc(size);

  // Copy ArrayBuffer to wasm memory
  // @ts-ignore
  Module.HEAPU8.set(new Uint8Array(arrayBuffer), bufferPtr);

  // @ts-ignore
  const success: boolean = Boolean(window._processFile(bufferPtr, size, filenamePtr));

  // @ts-ignore
  window._free(filenamePtr);
  // @ts-ignore
  window._free(bufferPtr);

  return success;
}


// temporary type def 
// TODO move to a separate file

/**
  * Get the Blocks to draw from wasm.
  * These Blocks represent the layout of the tilemap 
  */
export function getBlocks(): Block[] {
  // Get pointer to blocks array from Map in C++
  // @ts-ignore
  const blocksArrayPtr: number = window._getBlocks();

  // TODO: hardcoded. find out length
  const blocksArrayLength: number = 360;
  let blocksArray: Block[] = [];

  // Access block data from memory
  for (let i = 0; i < blocksArrayLength; i++) {
    // @ts-ignore
    const blockPointer = Module.HEAP32[blocksArrayPtr / 4 + i]; // Assuming 32-bit integers
    
    // @ts-ignore
    const blockRow = Module.HEAPU8[blocksArrayPointer + 0];
    // @ts-ignore
    const blockCol = Module.HEAPU8[blocksArrayPointer + 1];
    // @ts-ignore
    const blockId = Module.HEAPU8[blocksArrayPointer + 2];

    blocksArray.push({
      row: blockRow,
      col: blockCol,
      id: blockId
    } as Block);
  }

  return blocksArray;
}
