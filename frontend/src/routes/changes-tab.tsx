import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import React from "react";
import { FileDiffViewer } from "#/components/features/diff-viewer/file-diff-viewer";
import { retrieveAxiosErrorMessage } from "#/utils/retrieve-axios-error-message";
import { useGetGitChanges } from "#/hooks/query/use-get-git-changes";
import { I18nKey } from "#/i18n/declaration";
import { RootState } from "#/store";
import { RUNTIME_INACTIVE_STATES } from "#/types/agent-state";
import { EnhancedProTip } from "#/components/features/tips/enhanced-pro-tip";
import { InitializationScreen } from "#/components/features/initialization/initialization-screen";

// Error message patterns
const GIT_REPO_ERROR_PATTERN = /not a git repository/i;

function StatusMessage({ children }: React.PropsWithChildren) {
  return (
    <div className="w-full h-full flex flex-col items-center text-center justify-center text-2xl text-tertiary-light">
      {children}
    </div>
  );
}

function GitChanges() {
  const { t } = useTranslation();
  const { curAgentState } = useSelector((state: RootState) => state.agent);
  const isRuntimeInactive = RUNTIME_INACTIVE_STATES.includes(curAgentState);

  const {
    data: gitChanges,
    isSuccess,
    isError,
    error,
  } = useGetGitChanges();

  // Show initialization screen when runtime is inactive
  if (isRuntimeInactive) {
    return <InitializationScreen />;
  }

  // Handle error states
  if (isError && error) {
    const errorMessage = retrieveAxiosErrorMessage(error);
    const isGitRepoError = GIT_REPO_ERROR_PATTERN.test(errorMessage);

    if (isGitRepoError) {
      return (
        <StatusMessage>
          {t(I18nKey.DIFF_VIEWER$NO_CHANGES)}
        </StatusMessage>
      );
    }

    return (
      <StatusMessage>
        {errorMessage}
      </StatusMessage>
    );
  }

  // Show status message while loading or when no changes
  const statusMessage = !isSuccess
    ? [I18nKey.DIFF_VIEWER$NO_CHANGES]
    : gitChanges?.length === 0
    ? [I18nKey.DIFF_VIEWER$NO_CHANGES]
    : null;

  return (
    <main className="h-full overflow-y-scroll px-4 py-3 gap-3 flex flex-col items-center">
      {!isSuccess || !gitChanges.length ? (
        <div className="relative flex h-full w-full items-center">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
            {statusMessage && (
              <StatusMessage>
                {statusMessage.map((msg) => (
                  <span key={msg}>{t(msg)}</span>
                ))}
              </StatusMessage>
            )}
          </div>

          <div className="absolute inset-x-0 bottom-0">
            {!isError && gitChanges?.length === 0 && (
              <div className="max-w-2xl mb-4 text-m bg-tertiary rounded-xl p-4 text-left mx-auto">
                <EnhancedProTip />
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {gitChanges.map((change) => (
            <FileDiffViewer
              key={change.path}
              path={change.path}
              type={change.status}
            />
          ))}

          {/* ProTip at the bottom when there are changes */}
          <div className="max-w-2xl mt-4 text-m bg-tertiary rounded-xl p-4 text-left mx-auto">
            <EnhancedProTip />
          </div>
        </>
      )}
    </main>
  );
}

export default GitChanges;
