import { useSelector } from "react-redux";
import { RootState } from "#/store";
import { useTerminal } from "#/hooks/use-terminal";
import "@xterm/xterm/css/xterm.css";

function Terminal() {
  const { commands } = useSelector((state: RootState) => state.cmd);

  const ref = useTerminal({
    commands,
  });

  return (
    <div className="h-full min-h-0 flex-grow">
      <style>
        {`
          .xterm-viewport {
            padding: 1rem !important;
          }
        `}
      </style>
      <div ref={ref} className="h-full w-full" />
    </div>
  );
}

export default Terminal;
