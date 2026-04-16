import { Toaster as Sonner } from "sonner";

const Toaster = () => {
  return (
    <Sonner
      position="top-center"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'white',
          color: '#2D2D2D',
          border: '2px solid #8B9D83',
          borderRadius: '16px',
          padding: '16px',
          fontFamily: 'Arial, sans-serif',
        },
        className: 'toaster-item',
      }}
    />
  );
};

export { Toaster };