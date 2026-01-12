import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick?: () => void;
  to?: string;
}

export function FloatingActionButton({ onClick, to }: FloatingActionButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg gradient-accent hover:opacity-90 transition-all duration-200 hover:scale-105 z-40"
      size="icon"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  );
}
