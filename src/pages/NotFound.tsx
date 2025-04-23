
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-dragon-accent/5 to-white">
      <div className="parchment max-w-md w-full text-center py-12 px-6">
        <div className="mb-6">
          <div className="dragon-float w-40 h-40 mx-auto">
            <svg 
              viewBox="0 0 200 200" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto"
            >
              {/* Sad Dragon */}
              <path d="M100 140c30 0 60-20 60-50s-30-50-60-50-60 20-60 50 30 50 60 50z" 
                    fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="3" />
              
              <path d="M80 70c-5-20 0-40 20-50 10-5 25-5 40 10 5 5 0 15-10 15-10 0-15-10-30-5-10 5-15 15-15 20z" 
                    fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
              
              {/* Sad dragon eyes */}
              <path d="M90 50 Q95 55 100 50" stroke="#1A1F2C" strokeWidth="2" fill="none" />
              <path d="M110 50 Q115 55 120 50" stroke="#1A1F2C" strokeWidth="2" fill="none" />
              
              <path d="M60 100c-20-10-40 0-40 20s20 25 40 15c10-5 10-30 0-35z" 
                    fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
              <path d="M140 100c20-10 40 0 40 20s-20 25-40 15c-10-5-10-30 0-35z" 
                    fill="#7E69AB" stroke="#1A1F2C" strokeWidth="2" />
              
              <path d="M100 140c-10 10-20 15-30 5s0-30 10-20c5 5 10 10 20 15z" 
                    fill="#8B5CF6" stroke="#1A1F2C" strokeWidth="2" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">
          Oups ! Le dragon semble avoir égaré cette page.
        </p>
        
        <Link to="/">
          <Button className="bg-dragon-primary hover:bg-dragon-secondary">
            <Home className="h-4 w-4 mr-2" />
            Retour au Château
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
