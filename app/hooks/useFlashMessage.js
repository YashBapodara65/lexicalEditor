'use client';

import { useFlashMessageContext } from '../context/FlashMessageContext';

export default function useFlashMessage() {
  return useFlashMessageContext();
}
