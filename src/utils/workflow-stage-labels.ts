import { I18nKey } from "#/i18n/declaration";
import type { WorkflowSdlcStage } from "#/types/workflow";

export const WORKFLOW_STAGE_LABEL_KEYS: Record<WorkflowSdlcStage, I18nKey> = {
  requirements: I18nKey.WORKFLOWS$COLUMN_REQUIREMENTS,
  design: I18nKey.WORKFLOWS$COLUMN_DESIGN,
  implementation: I18nKey.WORKFLOWS$COLUMN_IMPLEMENTATION,
  verification: I18nKey.WORKFLOWS$COLUMN_VERIFICATION,
  release: I18nKey.WORKFLOWS$COLUMN_RELEASE,
};
