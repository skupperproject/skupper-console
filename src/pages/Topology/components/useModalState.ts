import { useState, useCallback } from 'react';

type ModalType = { type: 'process' | 'processPair'; id: string } | undefined;

const useModalState = () => {
  const [modalType, setModalType] = useState<ModalType>();

  const handleCloseModal = useCallback(() => {
    setModalType(undefined);
  }, []);

  const openProcessModal = useCallback((id: string) => {
    setModalType((prev) => ({ type: 'process', id: prev?.id !== id ? id : '' }));
  }, []);

  const openProcessPairModal = useCallback((id: string) => {
    setModalType({ type: 'processPair', id });
  }, []);

  return {
    modalType,
    handleCloseModal,
    openProcessModal,
    openProcessPairModal
  };
};

export default useModalState;
