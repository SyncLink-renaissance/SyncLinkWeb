import { useEffect } from "react";

const useOnMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, [callback]);
};

export default useOnMount;
