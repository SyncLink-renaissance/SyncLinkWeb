export const Toast = ({ message, isVisible, onClose }: any) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-8 transform -translate-x-1/2 bg-primary text-white py-2 px-4 rounded-full  z-50"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      onClick={onClose}>
      {message}
    </div>
  );
};
