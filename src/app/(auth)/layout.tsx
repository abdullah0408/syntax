import Navbar from "@/modules/home/ui/components/navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex flex-col min-h-screen max-h-screen">
      <Navbar />
      <div className="fixed inset-0 -z-10 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] bg-[radial-gradient(#c0c0c0_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="flex h-screen items-center justify-center">
        {children}
      </div>
    </main>
  );
};

export default Layout;
