import React from "react";
import { FaArrowRotateRight } from "react-icons/fa6";
import { FaExternalLinkAlt, FaHome } from "react-icons/fa";
import { Globe, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useActiveHost } from "#/hooks/query/use-active-host";
import { PathForm } from "#/components/features/served-host/path-form";
import { I18nKey } from "#/i18n/declaration";

function ServedApp() {
  const { t } = useTranslation();
  const { activeHost } = useActiveHost();
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [currentActiveHost, setCurrentActiveHost] = React.useState<
    string | null
  >(null);
  const [path, setPath] = React.useState<string>("hello");

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleOnBlur = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const urlInputValue = formData.get("url")?.toString();

      if (urlInputValue) {
        const url = new URL(urlInputValue);

        setCurrentActiveHost(url.origin);
        setPath(url.pathname);
      }
    }
  };

  const resetUrl = () => {
    setCurrentActiveHost(activeHost);
    setPath("");

    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleStartWebServer = () => {
    // This would trigger the agent to start a web server
    console.log("Starting web server...");
    // You can implement the actual logic here to send a message to the agent
  };

  React.useEffect(() => {
    resetUrl();
  }, [activeHost]);

  const fullUrl = `${currentActiveHost}/${path}`;

  if (!currentActiveHost) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Globe className="w-12 h-12 text-content" />
            </div>
            <h2 className="text-xl font-semibold text-content mb-2">Web Server</h2>
            <p className="text-sm text-content-secondary">
              Start a web server to see your application here
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-base rounded-lg">
              <Globe className="w-5 h-5 text-content" />
              <span className="text-sm text-content">Ready to serve your app</span>
            </div>

            <button
              onClick={handleStartWebServer}
              className="flex items-center justify-center gap-2 bg-white text-black rounded-lg px-6 py-3 text-sm font-medium hover:bg-gray-100 transition-colors w-full"
            >
              <Play className="w-4 h-4" />
              Start Web Server
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <div className="w-full p-2 flex items-center gap-4 border-b border-neutral-600">
        <button
          type="button"
          onClick={() => window.open(fullUrl, "_blank")}
          className="text-sm"
        >
          <FaExternalLinkAlt className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setRefreshKey((prev) => prev + 1)}
          className="text-sm"
        >
          <FaArrowRotateRight className="w-4 h-4" />
        </button>

        <button type="button" onClick={() => resetUrl()} className="text-sm">
          <FaHome className="w-4 h-4" />
        </button>
        <div className="w-full flex">
          <PathForm
            ref={formRef}
            onBlur={handleOnBlur}
            defaultValue={fullUrl}
          />
        </div>
      </div>
      <iframe
        key={refreshKey}
        title={t(I18nKey.SERVED_APP$TITLE)}
        src={fullUrl}
        className="w-full h-full"
      />
    </div>
  );
}

export default ServedApp;
