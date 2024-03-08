interface ContainerProps {
  children: React.ReactNode;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void; // Add this line
}

const Container = ({ children, onScroll }: ContainerProps) => {
  return (
    <div className="w-screen md:h-full flex items-center justify-center bg-backgroundLight dark:bg-backgroundDark text-backgroundDark dark:text-backgroundLight overflow-x-hidden">
      <main
        onScroll={onScroll} // Attach the passed callback here
        className="w-full h-[100vh] md:h-full max-w-screen xl:max-w-3xl xl:max-h-[95%] flex flex-col px-2 py-2 overflow-x-hidden hide-scrollbar">
        {children}
      </main>
    </div>
  );
};

export default Container;
