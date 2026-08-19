import { I18nKey } from "#/i18n/declaration";
import type { WorkflowSourceKind } from "#/types/workflow";

export const WORKFLOW_SOURCE_LABEL_KEYS: Record<WorkflowSourceKind, I18nKey> = {
  github: I18nKey.WORKFLOWS$SOURCE_GITHUB,
  linear: I18nKey.WORKFLOWS$SOURCE_LINEAR,
  jira: I18nKey.WORKFLOWS$SOURCE_JIRA,
};

export const WORKFLOW_SOURCE_ACCENT_COLORS: Record<WorkflowSourceKind, string> =
  {
    github: "#24292F",
    linear: "#5E6AD2",
    jira: "#0052CC",
  };
