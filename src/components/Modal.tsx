import React from "react";
// Remove framer-motion imports
// import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// Remove overlayVariants and modalVariants

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full sm:max-w-3xl max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="sticky top-0 right-0 z-10 float-right mt-2 mr-2 bg-white dark:bg-dark-800 rounded-full text-gray-500 hover:text-gray-700 text-2xl font-bold shadow"
          aria-label="Close"
          style={{ position: 'sticky' }}
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 