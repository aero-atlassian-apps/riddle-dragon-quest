
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#1A1F2C] bg-opacity-95 bg-[url('/grid.svg')] bg-repeat">
      <div className="border-2 border-[#00FF00]/20 bg-black/50 backdrop-blur-sm max-w-md w-full text-center py-12 px-6 rounded-lg shadow-[0_0_15px_rgba(0,255,0,0.1)]">
        <div className="relative after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-[radial-gradient(circle,rgba(0,255,0,0.1)_0%,transparent_70%)] after:pointer-events-none">
          <div className="font-mono text-[#00FF00] text-xs whitespace-pre mx-auto inline-block">
{
`    ╔════════════════════════════╗
    ║      PAGE NOT FOUND       ║
    ║         [ERROR]          ║
    ╚════════════════════════════╝
    
       ╔═══[SYSTEM ERROR]═══╗
       ║   404 NOT FOUND    ║
       ║    >_            ║
       ╚══════════════════╝
    
    ╔════[DEBUG INFORMATION]════╗
    ║  LOCATION: UNKNOWN        ║
    ║  STATUS: MISSING          ║
    ║  TRACE: LOST IN VOID      ║
    ╚═══════════════════════════╝
`}
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4 font-mono text-[#00FF00] animate-pulse">404</h1>
        <p className="text-xl mb-8 text-[#00FF00]/80 font-mono">
          > ERROR: Le gardien semble avoir égaré cette page_
        </p>
        
        <Link to="/">
          <Button className="bg-[#00FF00]/20 hover:bg-[#00FF00]/30 text-[#00FF00] border border-[#00FF00]/50 transition-all hover:shadow-[0_0_10px_rgba(0,255,0,0.3)]">
            <Home className="h-4 w-4 mr-2" />
            Retour au Château
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
